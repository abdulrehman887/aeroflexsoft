(function(){
const KEY="aeroflex_products";
const demo=window.AEROFLEX_DEMO || null;
function products(){try{let x=localStorage.getItem(KEY);return x?JSON.parse(x):window.AEROFLEX?.getProducts?.()||[];}catch(e){return [];}}
function save(ps){localStorage.setItem(KEY,JSON.stringify(ps));}
let ps=products(), editId=null;
const $=id=>document.getElementById(id);
function refresh(){
 ps=products(); $("totalArticles").textContent=ps.length;
 $("availableArticles").textContent=ps.filter(p=>p.variants.some(v=>+v.stock>0)).length;
 $("outArticles").textContent=ps.filter(p=>!p.variants.some(v=>+v.stock>0)).length;
 $("totalCtn").textContent=ps.reduce((s,p)=>s+p.variants.reduce((a,v)=>a+Math.max(0,+v.stock||0),0),0);
 $("adminRows").innerHTML=ps.map(p=>`<tr><td><img class="thumb" src="${p.image}" alt=""></td><td><b>${p.name}</b></td><td>${p.category}</td><td>Rs. ${Number(p.price).toLocaleString()}</td><td>${p.variants.map(v=>`${v.name} — ${v.stock} CTN`).join("<br>")}</td><td><button onclick="AEROFLEX_ADMIN.edit('${p.id}')">EDIT</button> <button class="danger" onclick="AEROFLEX_ADMIN.del('${p.id}')">DELETE</button></td></tr>`).join("");
}
function variantRow(v={name:"",stock:0,image:""}){
 const id="v_"+Math.random().toString(36).slice(2);
 return `<div class="variant-row" data-vid="${id}"><input class="v-name" placeholder="Colour name e.g. BLACK" value="${v.name||""}" required><input class="v-stock" type="number" min="0" step="1" placeholder="CTN" value="${v.stock??0}" required><input class="v-file" type="file" accept="image/*"><input type="hidden" class="v-image" value="${v.image||""}"><button type="button" class="remove-v">×</button></div>`;
}
function openForm(p){
 editId=p?.id||null;$("formTitle").textContent=p?"Edit Article":"Add Article";$("productId").value=editId||"";
 $("name").value=p?.name||"";$("price").value=p?.price||"";$("cat").value=p?.category||"AEROFLEX";$("size").value=p?.size||"Standard";$("condition").value=p?.condition||"10/10";$("description").value=p?.description||"";$("mainImage").value="";
 $("variantList").innerHTML=(p?.variants||[{name:"",stock:0,image:""}]).map(variantRow).join(""); bindVariantRemove();$("productModal").hidden=false;
}
function bindVariantRemove(){document.querySelectorAll(".remove-v").forEach(b=>b.onclick=()=>b.parentElement.remove());}
function readFile(file){return new Promise(r=>{if(!file)return r(null);const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(file);});}
async function submit(e){
 e.preventDefault();
 const old=ps.find(x=>x.id===editId), main=await readFile($("mainImage").files[0]);
 const rows=[...document.querySelectorAll(".variant-row")]; if(!rows.length){alert("Add at least one colour.");return;}
 const vars=[];for(const row of rows){const name=row.querySelector(".v-name").value.trim().toUpperCase();const stock=Math.max(0,parseInt(row.querySelector(".v-stock").value||0,10));const file=row.querySelector(".v-file").files[0];const image=await readFile(file);if(!name){alert("Every colour needs a name.");return;}vars.push({name,stock,image:image||row.querySelector(".v-image").value||main||old?.image||"assets/aeroflex-logo.png"});}
 const p={id:editId||("p_"+Date.now()),name:$("name").value.trim(),price:Number($("price").value||0),category:$("cat").value,size:$("size").value.trim(),condition:$("condition").value.trim(),description:$("description").value.trim(),image:main||old?.image||vars[0].image,variants:vars};
 ps=editId?ps.map(x=>x.id===editId?p:x):[...ps,p];save(ps);$("productModal").hidden=true;refresh();
}
function printStock(){
 const rows=ps.filter(p=>p.variants.some(v=>+v.stock>0));
 $("printDate").textContent=new Date().toLocaleString();
 $("printContent").innerHTML=rows.map(p=>{const av=p.variants.filter(v=>+v.stock>0);return `<div class="print-product"><img src="${p.image}" alt=""><div><h2>${p.name}</h2><p class="print-price">Rs. ${Number(p.price).toLocaleString()}</p>${av.map(v=>`<div class="print-colour"><b>${v.name}</b><span>${v.stock} CTN</span></div>`).join("")}</div></div>`}).join("")||"<p>No available stock.</p>";
 $("printArea").hidden=false;window.print();setTimeout(()=>{$("printArea").hidden=true;},500);
}
async function pdf(){
 // Opens the same clean stock sheet in the browser print dialog, where "Save as PDF" produces a PDF.
 printStock();
}
function login(){
 const email=$("adminEmail").value.trim(), pass=$("adminPassword").value;
 if(!email||!pass){$("loginMsg").textContent="Enter admin email and password.";return;}
 $("loginBox").hidden=true;$("dashboard").hidden=false;refresh();
}
window.AEROFLEX_ADMIN={edit:id=>openForm(ps.find(p=>p.id===id)),del:id=>{if(confirm("Delete this article?")){save(ps.filter(p=>p.id!==id));refresh();}}};
document.addEventListener("DOMContentLoaded",()=>{
 $("loginBtn").onclick=login;$("addBtn").onclick=()=>openForm();$("closeModal").onclick=()=>$("productModal").hidden=true;$("cancelForm").onclick=()=>$("productModal").hidden=true;$("addVariant").onclick=()=>{if(document.querySelectorAll(".variant-row").length<10){$("variantList").insertAdjacentHTML("beforeend",variantRow());bindVariantRemove();}else alert("Maximum 10 colours per article.");};$("productForm").onsubmit=submit;$("printBtn").onclick=printStock;$("pdfBtn").onclick=pdf;
});
})();