import fs from "fs/promises"; import path from "path";
const ROOT=process.cwd(), OUTI=path.join(ROOT,"_export/icons_inline"), OUTD=path.join(ROOT,"_export/icons_datauri");
await fs.mkdir(OUTI,{recursive:true}); await fs.mkdir(OUTD,{recursive:true});
const EXTS=[".html",".htm",".js",".jsx",".ts",".tsx",".svelte",".vue",".md",".json"];
const IGN=["node_modules","dist","build",".git",".vite",".next","out"];
async function walk(d){for(const e of await fs.readdir(d,{withFileTypes:true})){
  const p=path.join(d,e.name); if(IGN.some(x=>p.includes(`/${x}/`)||p.endsWith(`/${x}`))) continue;
  if(e.isDirectory()) await walk(p); else if(EXTS.includes(path.extname(e.name))) await scan(p);
}}
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
async function scan(f){const t=await fs.readFile(f,"utf8");
  let m,i=0; const r=/<svg[\s\S]*?<\/svg>/gi;
  while((m=r.exec(t))) await fs.writeFile(path.join(OUTI,`${slug(path.basename(f))}-${String(++i).padStart(2,"0")}.svg`),m[0]);
  let b,j=0; const rb=/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/gi;
  while((b=rb.exec(t))) await fs.writeFile(path.join(OUTD,`${slug(path.basename(f))}-b64-${String(++j).padStart(2,"0")}.svg`),Buffer.from(b[1],"base64").toString("utf8"));
  let u,k=0; const ru=/data:image\/svg\+xml;utf8,([^"' )]+)/gi;
  while((u=ru.exec(t))) await fs.writeFile(path.join(OUTD,`${slug(path.basename(f))}-utf8-${String(++k).padStart(2,"0")}.svg`),decodeURIComponent(u[1]));
}
await walk(ROOT); console.log("✅ Export fertig in _export/icons_svg, _export/icons_inline, _export/icons_datauri");