// J S K Enterprises - browser application module.
// IMPORTANT: Supabase publishable/anon key is intended for browser use with RLS.
// NEVER put a Supabase service_role key or an admin password in this file.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const STORE_DEFAULTS = {
  whatsappNumber: "9511228208",
  communityLink: "https://chat.whatsapp.com/BiejjHkJqSaLBaowqVvtIO",
  whatsappMessage: "Hello J S K Enterprises, I am visiting your B2B Electricals items marketplace. Please share more details.",
  orderNote: "Please confirm product availability and final bulk price before dispatch.",
  businessName: "J S K Enterprises"
};
const sampleProducts = [
  {name:"LED Bulb 9W",category:"Lighting Solutions",description:"Energy-efficient LED bulb for everyday commercial and residential use.",price:25,emoji:"💡",featured:true},
  {name:"LED Bulb 15W",category:"Lighting Solutions",description:"Bright, reliable lighting for shops, offices and homes.",price:75,emoji:"💡",featured:true},
  {name:"LED Tube Light",category:"Lighting Solutions",description:"Efficient LED tube light for offices, shops and commercial spaces.",price:80,emoji:"▰",featured:true},
  {name:"LED Flood Light",category:"Lighting Solutions",description:"High-brightness lighting solution for outdoor and industrial areas.",price:280,emoji:"🔆",featured:true},
  {name:"Switches",category:"Switches & Sockets",description:"Quality switches suitable for electrical supply and trade orders.",price:35,emoji:"▤"},
  {name:"Sockets",category:"Switches & Sockets",description:"Electrical sockets for shops, homes and commercial requirements.",price:45,emoji:"◉"},
  {name:"Wires & Cables",category:"Wires & Cables",description:"Electrical wires and cables for multiple installation needs.",price:120,emoji:"〰"},
  {name:"MCB Protection Device",category:"Protection Devices",description:"Protection devices for electrical distribution and safety.",price:160,emoji:"▥"}
];
const sampleBlogs = [
  {title:"LED Bulbs: Energy Saving vs Traditional Bulbs",category:"Lighting Guide",excerpt:"Learn how LED bulbs can help reduce energy consumption and provide long-lasting illumination.",body:"LED bulbs are designed to produce light efficiently while using less electricity than many traditional lighting options. For buyers, compare wattage, brightness, warranty, quality and intended use before selecting a product. For bulk orders, confirm specifications and availability with your supplier.",published_on:"2026-10-27"},
  {title:"Benefits of LED Lighting for Businesses",category:"Business Tips",excerpt:"Explore the benefits of LED lighting for shops, offices, warehouses and commercial spaces.",body:"LED lighting can offer energy efficiency, a long service life and a wide range of brightness options. Businesses should select lighting based on the space, operating hours, colour temperature and required illumination. Ask for product details and warranty terms before bulk purchasing.",published_on:"2026-10-27"}
];

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(message){ const el=$("toast"); if(!el)return; el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),3000); }
function waUrl(message=STORE_DEFAULTS.whatsappMessage, number=STORE_DEFAULTS.whatsappNumber){return `https://wa.me/${String(number).replace(/\D/g,"")}?text=${encodeURIComponent(message)}`;}
function applyTheme(){if(localStorage.getItem("jsk_dark_mode")==="1")document.body.classList.add("dark");$("themeToggle")?.addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("jsk_dark_mode",document.body.classList.contains("dark")?"1":"0");});}
async function getSettings(){
  const {data,error}=await supabase.from("store_settings").select("key,value");
  if(error) return STORE_DEFAULTS;
  return {...STORE_DEFAULTS,...Object.fromEntries((data||[]).map(x=>[x.key,x.value]))};
}
async function getProducts(){
  const {data,error}=await supabase.from("products").select("*").eq("is_active",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(error){console.warn(error.message);return sampleProducts.map((p,i)=>({id:`sample-${i}`, ...p,image_url:""}));}
  return data||[];
}
async function getBlogs(){
  const {data,error}=await supabase.from("blogs").select("*").eq("is_published",true).order("published_on",{ascending:false});
  if(error){console.warn(error.message);return sampleBlogs.map((b,i)=>({id:`sample-${i}`,...b}));}
  return data||[];
}
function imageMarkup(p){return p.image_url?`<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" loading="lazy">`:`<span class="product-emoji">${escapeHTML(p.emoji||"▦")}</span>`;}
function renderProductCards(products,settings){
  const grid=$("productGrid"); if(!grid)return;
  const q=($("searchProducts")?.value||"").toLowerCase(), cat=$("categoryFilter")?.value||"";
  const cats=[...new Set(products.map(p=>p.category).filter(Boolean))];
  const list=products.filter(p=>(!q||`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q))&&(!cat||p.category===cat));
  $("productCount").textContent=`${list.length} items`;
  $("categoryFilter").innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
  $("categoryFilter").value=cat;
  $("categoryChips").innerHTML='<button class="category-chip" data-category="">All</button>'+cats.map(c=>`<button class="category-chip" data-category="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join("");
  $("categoryChips").querySelectorAll("button").forEach(b=>{b.classList.toggle("active",b.dataset.category===cat);b.onclick=()=>{$("categoryFilter").value=b.dataset.category;renderProductCards(products,settings);}});
  grid.innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-image">${imageMarkup(p)}</div><div class="category">${escapeHTML(p.category)}</div><h3>${escapeHTML(p.name)}</h3><p class="product-desc">${escapeHTML(p.description)}</p><div class="price-row"><span class="price">₹${Number(p.price||0).toLocaleString("en-IN")}</span><span class="per-piece">per piece</span></div><div class="card-actions"><a class="btn btn-green" target="_blank" rel="noopener" href="${waUrl(`Hello J S K Enterprises, I am interested in ${p.name}. Please share bulk pricing.`,settings.whatsappNumber)}">WhatsApp Inquiry</a><button class="btn btn-outline details" data-id="${p.id}">View Details</button><button class="btn btn-blue" data-call-id="${p.id}">Request Call</button></div></article>`).join(""):'<div class="empty" style="grid-column:1/-1">No products match your search.</div>';
  grid.querySelectorAll("[data-id]").forEach(btn=>btn.addEventListener("click",()=>showProductDetail(products.find(p=>String(p.id)===btn.dataset.id),settings)));
  grid.querySelectorAll("[data-call-id]").forEach(btn=>btn.addEventListener("click",()=>{const p=products.find(x=>String(x.id)===btn.dataset.callId);if(!p)return;$("callProduct").value=p.id;$("callProductName").value=p.name;$("callModal").classList.add("show");}));
}
function showProductDetail(p,settings){
  if(!p)return; $("productModalBody").innerHTML=`<div class="detail-grid"><div class="detail-img">${imageMarkup(p)}</div><div class="detail-content"><div class="category">${escapeHTML(p.category)}</div><h3>${escapeHTML(p.name)}</h3><div class="price" style="margin-top:8px">₹${Number(p.price||0).toLocaleString("en-IN")} <span class="per-piece">/ piece</span></div><p>${escapeHTML(p.description)}</p><div class="order-note">${escapeHTML(p.note||settings.orderNote)}</div><a class="btn btn-green" target="_blank" rel="noopener" href="${waUrl(`Hello J S K Enterprises, I would like to enquire about ${p.name}.`,settings.whatsappNumber)}">Enquire on WhatsApp</a></div></div>`;
  $("productModal").classList.add("show");
}
function renderBlogCards(blogs){
  const root=$("blogGrid");if(!root)return;
  root.innerHTML=blogs.length?blogs.map(b=>`<article class="blog-card">${b.image_url?`<img class="blog-cover" src="${escapeHTML(b.image_url)}" alt="${escapeHTML(b.title)}">`:'<div class="blog-icon">▤</div>'}<div class="category">${escapeHTML(b.category||"General")} · ${escapeHTML(b.published_on||"")}</div><h3>${escapeHTML(b.title)}</h3><p>${escapeHTML(b.excerpt||"")}</p><button class="btn btn-outline btn-sm" data-blog-id="${b.id}">Read Article ↗</button></article>`).join(""):'<div class="empty" style="grid-column:1/-1">Blog posts will appear here.</div>';
  root.querySelectorAll("[data-blog-id]").forEach(btn=>btn.onclick=()=>{const b=blogs.find(x=>String(x.id)===btn.dataset.blogId);$("productModalBody").innerHTML=`${b.image_url?`<img class="blog-article-image" src="${escapeHTML(b.image_url)}">`:""}<div class="category">${escapeHTML(b.category||"General")} · ${escapeHTML(b.published_on||"")}</div><h2 style="color:var(--navy);margin:7px 0 14px">${escapeHTML(b.title)}</h2><p class="blog-body">${escapeHTML(b.body||b.excerpt)}</p>`;$("productModal").classList.add("show");});
}
async function submitInquiry(record){
  const {error}=await supabase.from("inquiries").insert(record);
  if(error)throw error;
}
async function initPublic(){
  if(!$("productGrid")&&!$("blogGrid"))return;
  applyTheme();
  const settings=await getSettings();
  ["topWhatsapp","heroWhatsapp","chatUsButton","contactWhatsapp"].forEach(id=>{if($(id))$(id).href=waUrl(settings.whatsappMessage,settings.whatsappNumber);});
  if($("communityButton"))$("communityButton").href=settings.communityLink;
  if($("popupCommunityLink"))$("popupCommunityLink").href=settings.communityLink;
  if($("footerEmail"))$("footerEmail").href="mailto:sumeet.khatri@gmail.com";
  const products=await getProducts(), blogs=await getBlogs();
  renderProductCards(products,settings);renderBlogCards(blogs);
  $("searchProducts")?.addEventListener("input",()=>renderProductCards(products,settings));
  $("categoryFilter")?.addEventListener("change",()=>renderProductCards(products,settings));
  $("closeProduct")?.addEventListener("click",()=>$("productModal").classList.remove("show"));
  $("closeCall")?.addEventListener("click",()=>$("callModal").classList.remove("show"));
  $("callModal")?.addEventListener("click",e=>{if(e.target===$("callModal"))$("callModal").classList.remove("show");});
  $("callForm")?.addEventListener("submit",async e=>{e.preventDefault();const record={inquiry_type:"Request Call",customer_name:$("callName").value.trim(),phone:$("callPhone").value.trim(),product_name:$("callProductName").value,requirement:$("callRequirement").value.trim(),status:"New"};try{await submitInquiry(record);e.target.reset();$("callModal").classList.remove("show");toast("Call request submitted successfully.");}catch(err){toast(`Could not submit call request: ${err.message}`);}});

  $("productModal")?.addEventListener("click",e=>{if(e.target===$("productModal"))$("productModal").classList.remove("show");});
  $("inquiryForm")?.addEventListener("submit",async e=>{
    e.preventDefault();const record={inquiry_type:"General Inquiry",customer_name:$("inqName").value.trim(),phone:$("inqPhone").value.trim(),requirement:$("inqRequirement").value.trim(),status:"New"};
    try{await submitInquiry(record);toast("Inquiry submitted successfully.");const msg=`Hello J S K Enterprises, I am ${record.customer_name}. Phone: ${record.phone}. Requirement: ${record.requirement}`;e.target.reset();window.open(waUrl(msg,settings.whatsappNumber),"_blank","noopener");}
    catch(err){toast(`Could not submit inquiry: ${err.message}`);}
  });
  if($("communityPopup")){ $("closeCommunity")?.addEventListener("click",()=>$("communityPopup").classList.remove("show"));$("communityLater")?.addEventListener("click",()=>$("communityPopup").classList.remove("show"));$("communityPopup").addEventListener("click",e=>{if(e.target===$("communityPopup"))$("communityPopup").classList.remove("show");});window.addEventListener("load",()=>setTimeout(()=>$("communityPopup").classList.add("show"),450));}
}

async function requireAdmin(){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)return {ok:false};
  const {data,error}=await supabase.from("admin_users").select("user_id").eq("user_id",session.user.id).maybeSingle();
  return {ok:!error&&!!data,user:session.user};
}
async function initLogin(){
  if(!$("loginForm"))return;
  $("loginForm").addEventListener("submit",async e=>{
    e.preventDefault();$("loginError").style.display="none";
    const {data,error}=await supabase.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});
    if(error){$("loginError").textContent=error.message;$("loginError").style.display="block";return;}
    const {data:allowed,error:allowError}=await supabase.from("admin_users").select("user_id").eq("user_id",data.user.id).maybeSingle();
    if(allowError||!allowed){await supabase.auth.signOut();$("loginError").textContent="This account is not authorised as an administrator. Add its Auth user ID to public.admin_users.";$("loginError").style.display="block";return;}
    location.href="masters.html";
  });
  const check=await requireAdmin();if(check.ok)location.href="masters.html";
}
let adminProducts=[],adminBlogs=[];
async function refreshMasters(){
  const [p,b]=await Promise.all([supabase.from("products").select("*").order("sort_order"),supabase.from("blogs").select("*").order("published_on",{ascending:false})]);
  if(p.error)throw p.error;if(b.error)throw b.error;adminProducts=p.data||[];adminBlogs=b.data||[];
  renderAdminProductList();renderAdminBlogList();await renderInquiries();await loadSettingsForm();
}
function renderAdminProductList(){
  $("productAdminList").innerHTML=adminProducts.map((p,i)=>`<div class="admin-item"><div class="item-info"><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.category)} · ₹${p.price} · Position ${i+1} · ${p.is_active?"Active":"Hidden"}</small></div><button class="btn btn-outline btn-sm" data-edit-product="${p.id}">Edit</button><button class="btn btn-outline btn-sm" data-toggle-product="${p.id}">${p.is_active?"Hide":"Show"}</button><button class="btn btn-outline btn-sm" data-delete-product="${p.id}">Delete</button></div>`).join("")||'<div class="empty">No products added yet.</div>';
  $("productAdminList").querySelectorAll("[data-edit-product]").forEach(x=>x.onclick=()=>{const p=adminProducts.find(y=>y.id==x.dataset.editProduct);$("productId").value=p.id;$("pName").value=p.name;$("pCategory").value=p.category;$("pDescription").value=p.description;$("pPrice").value=p.price;$("pImage").value=p.image_url||"";$("pEmoji").value=p.emoji||"▦";$("pNote").value=p.note||"";$("pFeatured").checked=p.featured;});
  $("productAdminList").querySelectorAll("[data-toggle-product]").forEach(x=>x.onclick=async()=>{const p=adminProducts.find(y=>y.id==x.dataset.toggleProduct);await supabase.from("products").update({is_active:!p.is_active}).eq("id",p.id);await refreshMasters();});
  $("productAdminList").querySelectorAll("[data-delete-product]").forEach(x=>x.onclick=async()=>{if(confirm("Delete this product?")){const {error}=await supabase.from("products").delete().eq("id",x.dataset.deleteProduct);if(error)toast(error.message);else{toast("Product deleted");await refreshMasters();}}});
}
function renderAdminBlogList(){
  $("blogAdminList").innerHTML=adminBlogs.map(b=>`<div class="admin-item"><div class="item-info"><strong>${escapeHTML(b.title)}</strong><small>${escapeHTML(b.category||"General")} · ${escapeHTML(b.published_on||"")} · ${b.is_published?"Published":"Draft"}</small></div><button class="btn btn-outline btn-sm" data-edit-blog="${b.id}">Edit</button><button class="btn btn-outline btn-sm" data-delete-blog="${b.id}">Delete</button></div>`).join("")||'<div class="empty">No blog posts yet.</div>';
  $("blogAdminList").querySelectorAll("[data-edit-blog]").forEach(x=>x.onclick=()=>{const b=adminBlogs.find(y=>y.id==x.dataset.editBlog);$("blogId").value=b.id;$("bTitle").value=b.title;$("bCategory").value=b.category||"";$("bExcerpt").value=b.excerpt;$("bBody").value=b.body;$("bDate").value=b.published_on||"";$("bImage").value=b.image_url||"";});
  $("blogAdminList").querySelectorAll("[data-delete-blog]").forEach(x=>x.onclick=async()=>{if(confirm("Delete this blog?")){const {error}=await supabase.from("blogs").delete().eq("id",x.dataset.deleteBlog);if(error)toast(error.message);else await refreshMasters();}});
}
async function renderInquiries(){
  const {data,error}=await supabase.from("inquiries").select("*").order("created_at",{ascending:false});
  if(error){$("inquiryTable").textContent=error.message;return;}
  const rows=data||[];
  $("inquiryTable").innerHTML=rows.length?`<table class="order-table"><thead><tr><th>Date</th><th>Type</th><th>Buyer</th><th>Phone</th><th>Product / Requirement</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map(o=>`<tr><td>${new Date(o.created_at).toLocaleString("en-IN")}</td><td>${escapeHTML(o.inquiry_type)}</td><td>${escapeHTML(o.customer_name)}</td><td>${escapeHTML(o.phone)}</td><td>${escapeHTML(o.product_name||o.requirement||"")}</td><td><select data-status="${o.id}"><option ${o.status==="New"?"selected":""}>New</option><option ${o.status==="Contacted"?"selected":""}>Contacted</option><option ${o.status==="Completed"?"selected":""}>Completed</option></select></td><td><button class="btn btn-outline btn-sm" data-del-inquiry="${o.id}">Delete</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">No orders or inquiries have been submitted yet.</div>';
  $("inquiryTable").querySelectorAll("[data-status]").forEach(x=>x.onchange=async()=>{const {error}=await supabase.from("inquiries").update({status:x.value}).eq("id",x.dataset.status);if(error)toast(error.message);});
  $("inquiryTable").querySelectorAll("[data-del-inquiry]").forEach(x=>x.onclick=async()=>{if(confirm("Delete this request?")){const {error}=await supabase.from("inquiries").delete().eq("id",x.dataset.delInquiry);if(error)toast(error.message);else renderInquiries();}});
}
async function loadSettingsForm(){
  const s=await getSettings();$("sWhatsapp").value=s.whatsappNumber;$("sCommunity").value=s.communityLink;$("sMessage").value=s.whatsappMessage;$("sOrderNote").value=s.orderNote;
}
async function initMasters(){
  if(!$("masterApp"))return;
  const auth=await requireAdmin();
  if(!auth.ok){$("authRequired").classList.remove("hidden");return;}
  $("masterApp").classList.remove("hidden");$("signedInAs").textContent=auth.user.email||"Administrator";
  $("logoutBtn").onclick=async()=>{await supabase.auth.signOut();location.href="admin.html";};
  $("productForm").onsubmit=async e=>{e.preventDefault();const id=$("productId").value;const row={name:$("pName").value.trim(),category:$("pCategory").value.trim(),description:$("pDescription").value.trim(),price:Number($("pPrice").value),image_url:$("pImage").value.trim()||null,emoji:$("pEmoji").value.trim()||"▦",note:$("pNote").value.trim(),featured:$("pFeatured").checked,is_active:true};const q=id?supabase.from("products").update(row).eq("id",id):supabase.from("products").insert(row);const {error}=await q;if(error)toast(error.message);else{$("productForm").reset();$("productId").value="";toast("Product saved");await refreshMasters();}};
  $("clearProduct").onclick=()=>{$("productId").value="";};
  $("blogForm").onsubmit=async e=>{e.preventDefault();const id=$("blogId").value;const row={title:$("bTitle").value.trim(),category:$("bCategory").value.trim()||"General",excerpt:$("bExcerpt").value.trim(),body:$("bBody").value.trim(),published_on:$("bDate").value||new Date().toISOString().slice(0,10),image_url:$("bImage").value.trim()||null,is_published:true};const q=id?supabase.from("blogs").update(row).eq("id",id):supabase.from("blogs").insert(row);const {error}=await q;if(error)toast(error.message);else{$("blogForm").reset();$("blogId").value="";toast("Blog saved");await refreshMasters();}};
  $("settingsForm").onsubmit=async e=>{e.preventDefault();const vals={whatsappNumber:$("sWhatsapp").value.trim(),communityLink:$("sCommunity").value.trim(),whatsappMessage:$("sMessage").value,orderNote:$("sOrderNote").value};const {error}=await supabase.from("store_settings").upsert(Object.entries(vals).map(([key,value])=>({key,value})),{onConflict:"key"});if(error)toast(error.message);else toast("Store settings saved.");};
  $("exportCsv").onclick=async()=>{const {data,error}=await supabase.from("inquiries").select("*").order("created_at",{ascending:false});if(error){toast(error.message);return;}const cols=["created_at","inquiry_type","customer_name","phone","product_name","requirement","status"];const csv=[cols.join(","),...(data||[]).map(r=>cols.map(k=>'"'+String(r[k]??"").replace(/"/g,'""')+'"').join(","))].join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="jsk-inquiries.csv";a.click();URL.revokeObjectURL(a.href);};
  try{await refreshMasters();}catch(err){toast(err.message);}
}

await initPublic();
await initLogin();
await initMasters();
