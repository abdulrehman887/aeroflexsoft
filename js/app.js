(function(){
  const cfg=window.AEROFLEX_CONFIG||{};
  let client=null;
  function getClient(){
    if(!client && window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_PUBLISHABLE_KEY && !String(cfg.SUPABASE_PUBLISHABLE_KEY).includes('PASTE_')) client=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
    return client;
  }
  function normalize(ps){return (ps||[]).map(p=>({...p,price:Number(p.price||0),variants:(p.variants||[]).map(v=>({...v,openingStock:Number(v.openingStock??0),stock:Number(v.stock??0)}))}));}
  async function getProducts(){
    const c=getClient();
    if(c){
      const {data:rows,error}=await c.from('products').select('*').order('name',{ascending:true});
      if(!error && rows){
        const ids=rows.map(r=>r.id);
        let vars=[];
        if(ids.length){const q=await c.from('product_variants').select('*').in('product_id',ids); if(!q.error) vars=q.data||[];}
        return normalize(rows.map(p=>({...p,variants:vars.filter(v=>String(v.product_id)===String(p.id)).map(v=>({id:v.id,name:v.name||v.colour_name||'',image:v.image||'',stock:Number(v.stock||0),openingStock:Number(v.opening_stock??v.openingStock??0)}))})));
      }
    }
    try{return normalize(JSON.parse(localStorage.getItem('aeroflex_products')||'[]'));}catch(e){return [];}
  }
  async function saveProduct(p){
    const c=getClient();
    if(!c){
      const ps=normalize(JSON.parse(localStorage.getItem('aeroflex_products')||'[]'));
      const i=ps.findIndex(x=>String(x.id)===String(p.id));
      if(i>=0) ps[i]=normalize([p])[0]; else ps.push(normalize([p])[0]);
      localStorage.setItem('aeroflex_products',JSON.stringify(ps));
      return {error:null};
    }
    const payload={id:p.id,name:p.name,price:Number(p.price||0),category:p.category,size:p.size||'Standard',condition:p.condition||'10/10',description:p.description||'',image:p.image||''};
    const up=await c.from('products').upsert(payload,{onConflict:'id'}); if(up.error)return up;
    const del=await c.from('product_variants').delete().eq('product_id',p.id); if(del.error)return del;
    const variants=(p.variants||[]).map(v=>({id:v.id,product_id:p.id,name:v.name||v.colour_name||'',colour_name:v.name||v.colour_name||'',image:v.image||'',stock:Number(v.stock||0),opening_stock:Number(v.openingStock??0)}));
    if(variants.length){const ins=await c.from('product_variants').insert(variants); if(ins.error)return ins;}
    return {error:null};
  }
  async function saveProducts(ps){
    for(const p of ps){const r=await saveProduct(p);if(r?.error)return r;}
    return {error:null};
  }
  async function deleteProduct(id){const c=getClient();if(c){const d=await c.from('product_variants').delete().eq('product_id',id);if(d.error)return d;const p=await c.from('products').delete().eq('id',id);return p;}try{let ps=JSON.parse(localStorage.getItem('aeroflex_products')||'[]');localStorage.setItem('aeroflex_products',JSON.stringify(ps.filter(p=>p.id!==id)));return {error:null};}catch(e){return {error:e};}}
  async function uploadImage(file,path){
    if(!file)return null; const c=getClient(); if(!c) return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(file);});
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase(); const clean=path.replace(/[^a-zA-Z0-9/_-]/g,'_')+'.'+ext;
    const up=await c.storage.from('product-images').upload(clean,file,{upsert:true,contentType:file.type||'image/jpeg'}); if(up.error)throw up.error;
    const pub=c.storage.from('product-images').getPublicUrl(clean); return pub.data.publicUrl;
  }
  function waLink(p,v,request){const n=(cfg.WHATSAPP_NUMBER||'').replace(/\D/g,'');if(!n)return '#';const text=`ASALAMUALAIKUM AEROFLEX,\n\nI want to ${request?'request':'order'}:\n\nProduct: ${p.name}\n\nColour: ${v?.name||'Not selected'}\n\nPrice: Rs. ${Number(p.price||0).toLocaleString()}\n\nSize: ${p.size||'Standard'}\n\nCondition: ${p.condition||'10/10'}\n\nName:\n\nPhone:\n\nAddress:\n\nJazakAllah Khair.`;return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;}
  function productCard(p,mode){
    const avail=(p.variants||[]).filter(v=>Number(v.stock)>0);
    const visible=mode==='available'?avail:(p.variants||[]);
    if(mode==='available'&&!avail.length)return '';
    const first=visible[0]||{image:p.image};
    const href=`product.html?id=${encodeURIComponent(String(p.id))}&mode=${encodeURIComponent(mode)}`;
    return `<article class="product-card" data-product-href="${href}">
      <a class="product-link" href="${href}" aria-label="Open article">
        <div class="product-img"><img src="${first.image||p.image||'assets/aeroflex-logo.png'}" alt="${p.name||'AEROFLEX article'}">${mode==='all'&&!avail.length?'<span class="badge">ORDER ON REQUEST</span>':''}</div>
        <div class="product-info"><h3>${p.name||'AEROFLEX ARTICLE'}</h3><span>${p.category||''}</span><strong>Rs. ${Number(p.price||0).toLocaleString()}</strong>
        ${mode==='available'?`<small class="ctn-pill">${avail.map(v=>`${v.name}: ${v.stock} CTN`).join(' • ')}</small>`:`<small>${(p.variants||[]).map(v=>v.name).filter(Boolean).join(' • ')}</small>`}</div>
      </a>
    </article>`;
  }
  async function renderShop({mode}){const grid=document.getElementById('productGrid'),search=document.getElementById('search'),category=document.getElementById('category'),sort=document.getElementById('sort');const params=new URLSearchParams(location.search);if(params.get('category'))category.value=params.get('category');async function go(){let ps=await getProducts();const q=(search.value||'').toLowerCase();ps=ps.filter(p=>(!q||p.name.toLowerCase().includes(q))&&(!category.value||p.category===category.value));if(mode==='available')ps=ps.filter(p=>p.variants.some(v=>v.stock>0));ps.sort((a,b)=>sort.value==='za'?b.name.localeCompare(a.name):sort.value==='low'?a.price-b.price:sort.value==='high'?b.price-a.price:a.name.localeCompare(b.name));grid.innerHTML=ps.map(p=>productCard(p,mode)).join('')||'<div class="empty">No articles found.</div>';}[search,category,sort].forEach(x=>x.addEventListener('input',go));await go();}
  async function renderProduct(){const id=new URLSearchParams(location.search).get('id'),mode=new URLSearchParams(location.search).get('mode')||'all',p=(await getProducts()).find(x=>String(x.id)===String(id)),el=document.getElementById('productDetail');if(!p){el.innerHTML='<h1>Product not found</h1>';return;}let selected=(mode==='available'?p.variants.find(v=>v.stock>0):p.variants[0])||null;const draw=()=>{const vars=mode==='available'?p.variants.filter(v=>v.stock>0):p.variants;el.innerHTML=`<div class="detail-media"><img src="${selected?.image||p.image||'assets/aeroflex-logo.png'}" alt="${p.name}"></div><div class="detail-copy"><span class="eyebrow">${p.category}</span><h1>${p.name}</h1><h2>Rs. ${Number(p.price).toLocaleString()}</h2><p>${p.description||''}</p><div class="meta"><span>Size: ${p.size}</span><span>Condition: ${p.condition}</span></div>${vars.length?`<h3>COLOUR: <b>${selected?.name||'-'}</b></h3><div class="variants">${vars.map(v=>`<button class="variant ${v===selected?'selected':''}" data-id="${v.id}">${v.name}</button>`).join('')}</div>`:''}<a class="btn gold order-btn" href="${waLink(p,selected,mode==='all'&&(!selected||selected.stock<=0))}" target="_blank">${mode==='available'?'ORDER ON WHATSAPP':'ORDER ON WHATSAPP / REQUEST'}</a></div>`;el.querySelectorAll('.variant').forEach(b=>b.onclick=()=>{selected=p.variants.find(v=>String(v.id)===String(b.dataset.id))||selected;draw();});};draw();}
  async function setup(){document.querySelectorAll('#headerWa,#heroWa,#ctaWa').forEach(a=>a.href=waLink({name:'AEROFLEX'},null,true));const f=document.getElementById('featuredGrid');if(f){const ps=await getProducts();f.innerHTML=ps.map(p=>productCard(p,'all')).join('');}document.querySelectorAll('#year').forEach(x=>x.textContent=new Date().getFullYear());document.addEventListener('click',function(e){const card=e.target.closest('.product-card');if(!card)return;const link=e.target.closest('a.product-link');if(link)return;const href=card.getAttribute('data-product-href');if(href)window.location.assign(href);});}
  window.AEROFLEX={getProducts,saveProduct,saveProducts,deleteProduct,uploadImage,renderShop,renderProduct,waLink,getClient};document.addEventListener('DOMContentLoaded',setup);
})();
