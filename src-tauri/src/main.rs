// KeyCopy to STL: desktop shell. All geometry lives in the bundled UI;
// this side only provides native dialogs and file I/O.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

#[derive(Serialize)]
struct LoadedFile {
    name: String,
    path: String,
    text: String,
}

#[derive(Deserialize)]
struct OutFile {
    name: String,
    data: Vec<u8>,
}

/// Remembers the last folder used in any dialog (handy when working off the Flipper's SD card).
#[derive(Default)]
struct LastDir(Mutex<Option<PathBuf>>);

impl LastDir {
    fn get(&self) -> Option<PathBuf> {
        self.0.lock().ok().and_then(|d| d.clone())
    }
    fn set(&self, p: &Path) {
        let dir = if p.is_dir() { p.to_path_buf() } else { p.parent().map(Path::to_path_buf).unwrap_or_default() };
        if let Ok(mut d) = self.0.lock() {
            *d = Some(dir);
        }
    }
}

const MAX_KEYCOPY_BYTES: u64 = 64 * 1024;

fn read_keycopy(p: &Path) -> Option<LoadedFile> {
    let meta = fs::metadata(p).ok()?;
    if !meta.is_file() || meta.len() > MAX_KEYCOPY_BYTES {
        return None;
    }
    let text = fs::read_to_string(p).ok()?;
    Some(LoadedFile {
        name: p.file_stem()?.to_string_lossy().into_owned(),
        path: p.to_string_lossy().into_owned(),
        text,
    })
}

fn is_keycopy(p: &Path) -> bool {
    p.extension().map(|e| e.eq_ignore_ascii_case("keycopy")).unwrap_or(false)
}

fn walk(dir: &Path, depth: u32, out: &mut Vec<LoadedFile>) {
    if depth > 8 {
        return;
    }
    let Ok(entries) = fs::read_dir(dir) else { return };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|e| e.path()).collect();
    paths.sort();
    for p in paths {
        let hidden = p.file_name().map(|n| n.to_string_lossy().starts_with('.')).unwrap_or(true);
        if hidden {
            continue;
        }
        if p.is_dir() {
            walk(&p, depth + 1, out);
        } else if is_keycopy(&p) {
            if let Some(f) = read_keycopy(&p) {
                out.push(f);
            }
        }
    }
}

fn clean_name(name: &str) -> String {
    let n: String = name
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() || "-_.".contains(c) { c } else { '_' })
        .collect();
    if n.trim_matches(['.', '_']).is_empty() { "key".into() } else { n }
}

#[tauri::command]
async fn open_keycopy_files(app: AppHandle, last: State<'_, LastDir>) -> Result<Vec<LoadedFile>, String> {
    let mut dlg = app.dialog().file().set_title("Open Key Copier files").add_filter("Key Copier file", &["keycopy"]);
    if let Some(d) = last.get() {
        dlg = dlg.set_directory(d);
    }
    let Some(picked) = dlg.blocking_pick_files() else { return Ok(vec![]) };
    let mut out = Vec::new();
    for fp in picked {
        let p = fp.into_path().map_err(|e| e.to_string())?;
        last.set(&p);
        match read_keycopy(&p) {
            Some(f) => out.push(f),
            None => return Err(format!("Couldn't read {}", p.display())),
        }
    }
    Ok(out)
}

#[tauri::command]
async fn open_keycopy_folder(app: AppHandle, last: State<'_, LastDir>) -> Result<Vec<LoadedFile>, String> {
    let mut dlg = app.dialog().file().set_title("Choose a folder of Key Copier files");
    if let Some(d) = last.get() {
        dlg = dlg.set_directory(d);
    }
    let Some(fp) = dlg.blocking_pick_folder() else { return Ok(vec![]) };
    let dir = fp.into_path().map_err(|e| e.to_string())?;
    last.set(&dir);
    let mut out = Vec::new();
    walk(&dir, 0, &mut out);
    if out.is_empty() {
        return Err(format!("No .keycopy files in {}", dir.display()));
    }
    Ok(out)
}

/// Native "Save as" for one file. Returns the written path, or None if cancelled.
#[tauri::command]
async fn save_file(app: AppHandle, last: State<'_, LastDir>, name: String, data: Vec<u8>) -> Result<Option<String>, String> {
    let name = clean_name(&name);
    let ext = Path::new(&name).extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    let label = match ext.as_str() {
        "stl" => "STL mesh",
        "dxf" => "DXF drawing",
        _ => "File",
    };
    let mut dlg = app.dialog().file().set_title("Save").set_file_name(&name).add_filter(label, &[ext.as_str()]);
    if let Some(d) = last.get() {
        dlg = dlg.set_directory(d);
    }
    let Some(fp) = dlg.blocking_save_file() else { return Ok(None) };
    let mut p = fp.into_path().map_err(|e| e.to_string())?;
    if p.extension().is_none() && !ext.is_empty() {
        p.set_extension(&ext);
    }
    fs::write(&p, &data).map_err(|e| format!("Couldn't write {}: {e}", p.display()))?;
    last.set(&p);
    Ok(Some(p.to_string_lossy().into_owned()))
}

/// Pick a folder once and write several files into it. Returns the folder, or None if cancelled.
#[tauri::command]
async fn save_many(app: AppHandle, last: State<'_, LastDir>, files: Vec<OutFile>) -> Result<Option<String>, String> {
    let mut dlg = app.dialog().file().set_title("Choose where to save the keys");
    if let Some(d) = last.get() {
        dlg = dlg.set_directory(d);
    }
    let Some(fp) = dlg.blocking_pick_folder() else { return Ok(None) };
    let dir = fp.into_path().map_err(|e| e.to_string())?;
    for f in &files {
        let p = dir.join(clean_name(&f.name));
        fs::write(&p, &f.data).map_err(|e| format!("Couldn't write {}: {e}", p.display()))?;
    }
    last.set(&dir);
    Ok(Some(dir.to_string_lossy().into_owned()))
}

/// .keycopy files given on the command line (also how "Open with" / double-click arrives).
#[tauri::command]
fn launch_files() -> Vec<LoadedFile> {
    let mut out = Vec::new();
    for a in std::env::args_os().skip(1) {
        let p = PathBuf::from(a);
        if p.is_dir() {
            walk(&p, 0, &mut out);
        } else if is_keycopy(&p) {
            if let Some(f) = read_keycopy(&p) {
                out.push(f);
            }
        }
    }
    out
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(LastDir::default())
        .invoke_handler(tauri::generate_handler![open_keycopy_files, open_keycopy_folder, save_file, save_many, launch_files])
        .run(tauri::generate_context!())
        .expect("error while running KeyCopy to STL");
}
