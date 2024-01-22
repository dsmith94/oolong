import { debounce } from "https://deno.land/std@0.194.0/async/debounce.ts";
import { parse } from "https://deno.land/std@0.202.0/yaml/mod.ts";


function getSafeObjectName(path: string, file: string) {

  path = path.replace('lessons/', '');
  const sep = file.split('.');
  const joined = sep.join('-');
  const withoutExt = joined.slice(0, -5);
  if (path !== '') {
    return path + '/' + withoutExt;
  } else {
    return withoutExt;
  }

}



function withoutExtension(file: string) {

  const sep = file.split('.');
  const joined = sep.join('-');
  const withoutExt = joined.slice(0, -5);
  return withoutExt;

}



function getExt(path: string) {

    const sep = path.split('.');
    const last = sep.pop() ?? '';
    return last.toLowerCase();

}


async function scan(path: string, fileContent: string[], fileName: string[], setError: (s: string) => void) {

  const dir = Deno.readDir(path);
  for await (const f of dir) {
    const fullpath = `${path}/${f.name}`;
    if (f.isFile) {
      if (getExt(fullpath) === 'yaml') {
        let yaml = await Deno.readTextFile(fullpath);
        yaml += `\n\nfile name: ${getSafeObjectName(path, f.name)}`;
        yaml += `\n\nchapter: ${withoutExtension(f.name)}`;
        try {
          // deno-lint-ignore no-explicit-any
          const object: any = parse(yaml);
          const s = `"${getSafeObjectName(path, f.name)}": ${JSON.stringify(object)}`;
          fileContent.push(s);
          fileName.push(fullpath);  
        } catch (e) {
          setError(`${e} \n\n in file: ${fullpath}`);
          return;
        }
      }
    } else if (f.isDirectory) {
      await scan(fullpath, fileContent, fileName, setError);
    }
  }

}


async function refreshset(setStory: (s: string) => void) {

    const fileName: string[] = [];

    let fileContent: string[] = [];
    const setError = (e: string) => {
      fileContent = [`err: \`${e}\``];
    }
    await scan('lessons', fileContent, fileName, setError);
    const lessons = `{${fileContent.join(',')}}`;
    const encoded = `export const stl = ${JSON.stringify(lessons)};`;
    setStory(encoded ?? '');

}


async function checksrc() {

    const watcher = Deno.watchFs(["lessons"]);

    const ref = debounce((_event) => {
        refreshset(s => Deno.writeTextFile('dist/lessons.min.js', s));
    }, 200);

    for await (const event of watcher) {
       ref(event);
    }

}


export function run() {

    refreshset(s => Deno.writeTextFile('dist/lessons.min.js', s));

}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  run();
}