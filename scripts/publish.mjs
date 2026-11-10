import {readFileSync,mkdirSync,writeFileSync,createWriteStream} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {Readable,Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';

const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH));
const manifest=JSON.parse(event.inputs.manifest),repository=process.env.GITHUB_REPOSITORY;
if(repository!=='BC-works/slate-downloads')throw new Error('Unexpected distribution repository');
const {version,tag,requestId,files,notes}=manifest;
if(manifest.schema!==1||!/^\d+\.\d+\.\d+$/.test(version)||tag!==`v${version}`||tag!==event.inputs.tag||requestId!==event.inputs.request_id)throw new Error('Invalid release identity');
const required=[`Slate-${version}-Setup-x64.exe`,`Slate-${version}-Setup-x64.exe.blockmap`,`Slate-${version}-x64.AppImage`,`Slate-${version}-x64.tar.gz`,'latest.yml','latest-linux.yml'].sort();
if(!Array.isArray(files)||files.length!==required.length||JSON.stringify(files.map(f=>f.name).sort())!==JSON.stringify(required))throw new Error('Only the six approved distribution files may be published');
if(typeof notes!=='string'||notes.length>10000)throw new Error('Invalid public release notes');
for(const file of files){
  const url=new URL(file.url);
  if(url.protocol!=='https:'||!['release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(url.hostname)||url.username||url.password||!/^\w{64}$/.test(file.sha256)||!/^[a-f0-9]{64}$/.test(file.sha256)||!Number.isSafeInteger(file.size)||file.size<1||file.size>600*1024*1024)throw new Error('Invalid distribution asset descriptor');
  console.log(`::add-mask::${file.url}`);
}
const checksumName=`Slate-${version}-SHA256SUMS.txt`;
const sums=[...files].sort((a,b)=>a.name.localeCompare(b.name,'en')).map(file=>`${file.sha256}  ${file.name}\n`).join('');
const expected=new Map(files.map(file=>[file.name,file.sha256]));expected.set(checksumName,createHash('sha256').update(sums).digest('hex'));
function api(endpoint){return JSON.parse(execFileSync('gh',['api',endpoint],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}
function missing(error){try{if(String(JSON.parse(String(error.stdout)).status)==='404')return true;}catch{}return String(error.stderr).includes('(HTTP 404)');}
function release(){try{return api(`repos/${repository}/releases/tags/${tag}`);}catch(error){if(missing(error))return null;throw error;}}
function assertComplete(release){
  if(release.assets.length!==expected.size)throw new Error('Published asset set is incomplete or contains unexpected files');
  for(const asset of release.assets)if(asset.state!=='uploaded'||asset.digest!==`sha256:${expected.get(asset.name)}`)throw new Error(`Published asset differs: ${asset.name}`);
}
const existing=release();
if(existing&&!existing.draft){assertComplete(existing);console.log(`Release ${tag} already has identical verified assets.`);process.exit(0);}
let latest;
try{latest=api(`repos/${repository}/releases/latest`);}catch(error){if(!missing(error))throw error;}
if(latest){
  const before=latest.tag_name.replace(/^v/,'').split('.').map(Number),after=version.split('.').map(Number);
  const first=after.findIndex((part,index)=>part!==before[index]);
  if(before.length!==3||after.some(part=>!Number.isSafeInteger(part))||first<0||after[first]<before[first])throw new Error('A stable public release must advance the latest version');
}
mkdirSync('release-files',{recursive:true});
const hashes=new Map();
await Promise.all(files.map(async file=>{
  const response=await fetch(file.url,{signal:AbortSignal.timeout(8*60*1000)});
  if(!response.ok||!response.body)throw new Error(`Could not download ${file.name}; refresh the transfer links and retry (${response.status})`);
  let size=0;const sha256=createHash('sha256'),sha512=createHash('sha512');
  await pipeline(Readable.fromWeb(response.body),new Transform({transform(chunk,encoding,callback){size+=chunk.length;if(size>file.size){callback(new Error(`Unexpected size for ${file.name}`));return;}sha256.update(chunk);sha512.update(chunk);callback(null,chunk);}}),createWriteStream(`release-files/${file.name}`,{flags:'wx'}));
  if(size!==file.size||sha256.digest('hex')!==file.sha256)throw new Error(`Integrity check failed for ${file.name}`);
  hashes.set(file.name,sha512.digest('base64'));
  console.log(`Verified ${file.name}`);
}));
for(const [metadata,binary]of [['latest.yml',`Slate-${version}-Setup-x64.exe`],['latest-linux.yml',`Slate-${version}-x64.AppImage`]]){
  const text=readFileSync(`release-files/${metadata}`,'utf8');
  const clean=value=>value.trim().replace(/^['"]|['"]$/g,'');
  if(clean(text.match(/^version:\s*(.+)$/m)?.[1]||'')!==version)throw new Error('Update manifest version mismatch');
  if(clean(text.match(/^path:\s*(.+)$/m)?.[1]||'')!==binary)throw new Error('Update manifest installer mismatch');
  if(clean(text.match(/^sha512:\s*(.+)$/m)?.[1]||'')!==hashes.get(binary))throw new Error('Update manifest SHA-512 mismatch');
  const entries=[...text.matchAll(/- url:\s*(\S+)\s*\n\s+sha512:\s*(\S+)/g)];
  if(!entries.length)throw new Error('Missing manifest file entries');
  for(const entry of entries){const name=decodeURIComponent(clean(entry[1]));if(!hashes.has(name)||clean(entry[2])!==hashes.get(name))throw new Error('Update manifest references an unpublished or mismatched file');}
}
writeFileSync(`release-files/${checksumName}`,sums);
writeFileSync('public-release-notes.md',notes);
if(!existing)execFileSync('gh',['release','create',tag,'--repo',repository,'--title',`Slate ${version}`,'--notes-file','public-release-notes.md','--draft'],{stdio:'inherit'});
execFileSync('gh',['release','upload',tag,...[...expected.keys()].map(name=>`release-files/${name}`),'--repo',repository,'--clobber'],{stdio:'inherit'});
assertComplete(release());
execFileSync('gh',['release','edit',tag,'--repo',repository,'--draft=false','--latest'],{stdio:'inherit'});
console.log(`Published https://github.com/${repository}/releases/tag/${tag}`);
