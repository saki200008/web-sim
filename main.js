const zaloLink = "https://zalo.me/0900000000"; // ĐỔI SỐ ZALO

// DATA SIM
const BASE_URL = "https://raw.githubusercontent.com/saki200008/sim-data-v1/refs/heads/main/data/"; 

let sims = [];
let sims200 = [];
const filter = {
  pageSize: 0,
  total: 0,
  totalPage: 0,
  currentPage: 1,
  menh:"",
  mang:"",
  search: ""
}
const map_menh = {"M": "Mộc", "T":"Thổ", "H":"Hỏa", "TH":"Thuỷ", "K":"Kim"}
const map_mang = {"VT": "Viettel", "VN":"Vinaphone", "MB":"Mobifone"}
const map_mau = {"M":"#00b6ff", "T":"#ff6f70", "H":"red", "TH":"#1dff1d", "K":"yellow"}
const map_mau_mang = {"VT":"red", "VN":"#0e75d1", "MB":"#f44336"}
const simList = document.getElementById('simList');
const menhSelect = document.getElementById('menh');
const mangInput = document.getElementById('mang');
const searchInput = document.getElementById('search');
const page = document.getElementById('page');
const btnPrev = document.getElementById("btnPrev")
const btnNext = document.getElementById("btnNext")
// const btnLuan = document.getElementById('luan-giai');

function getMenhFromYear(year){
 if(!year) return '';
 const can = year % 10;
 const map = ['Kim','Kim','Thủy','Thủy','Mộc','Mộc','Hỏa','Hỏa','Thổ','Thổ'];
 return map[can];
}



function formatPrice(p){return p.toLocaleString('vi-VN')}

function render(sims){
 simList.innerHTML='';
 
 sims.forEach(s =>{
    let so_show = s.so.match(/.{1,3}/g)?.join(".") || so
  simList.innerHTML += `
  <div class="sim-card">
    <div class="sim-number">0${so_show}</div>
    <div class="sim-info" ><span class="menh" style="color:${map_mau[s.me]}">Mệnh ${map_menh[s.me]}</span> - <span style="color:${map_mau_mang[s.ma]}">${map_mang[s.ma]}</span></div>

    <div class="price" >Giá bán: ${formatPrice(s.g)}</div>
    <div class="actions">
      <a class="btn btn-buy" href="${zaloLink}" target="_blank">Mua ngay</a>         
      <button class="btn btn-buy" id="luan-giai" onclick="openPopup(${s.so})">Luận giải</button>  
    </div>
    <div class="zalo">
      <a class="btn btn-chat" href="${zaloLink}" target="_blank">Zalo tư vấn</a> 
    </div>
  </div>`;
 });
 updatePaginationButtons()
}


menhSelect.addEventListener("change", e => handler_change("menh", e.target.value));
mangInput.addEventListener("change", e => handler_change("mang", e.target.value));
searchInput.addEventListener("input", e => handler_change("search", e.target.value));
// render();

function handler_filter(key, value) {
  filter[key] = value
}
async function handler_change(key, value) {
  
  handler_filter(key, value)
  
  handler_filter("currentPage", 1)
  page.innerText = `Trang: ${filter["currentPage"]}`
  updatePaginationButtons()
  const res200 = await fetch(`${BASE_URL}page200_${filter["currentPage"]}.json`);
    sims = await res200.json();
    
    list_sim = sims.filter( s =>{
      return (!filter["menh"]||s.me===filter["menh"]) &&
            (!filter["mang"] || s.ma===filter["mang"]) &&
            (!filter["search"] || s.so.replace(/\s/g,'').includes(filter["search"]))});

  render(list_sim);

}

async function loadPage(page, tang=true){
  const key = `sim_page_${page}`;
  // const cache = localStorage.getItem(key);
  let uapte_page = 1
  let list_sim = []
  // if(cache){
  //   sims = JSON.parse(cache)
  //   render(sims);
  //   return;
  // }
  handler_filter("currentPage", page)
  if (filter["menh"] || filter["mang"] || filter["search"]) {
    if (tang) {
      for (let i = filter["currentPage"]; i < filter["totalPage"]; i++) {
      const res200 = await fetch(`${BASE_URL}page200_${i}.json`);
      sims = await res200.json();
      list_sim = sims.filter( s =>{
        return (!filter["menh"] || s.me===filter["menh"]) &&
              (!filter["mang"] || s.ma===filter["mang"]) &&
              (!filter["search"] || s.so.replace(/\s/g,'').includes(filter["search"]))});
        if (list_sim.length > 0) {  
          page = i        
          break;
        } else {
          list_sim = []
        }
        
      }

    } else {
      for (let i = page; i > 0; i--) {
      const res200 = await fetch(`${BASE_URL}page200_${i}.json`);
      sims = await res200.json();
      list_sim = sims.filter( s =>{
        return (!filter["menh"] || s.me===filter["menh"]) &&
              (!filter["mang"] || s.ma===filter["mang"]) &&
              (!filter["search"] || s.so.replace(/\s/g,'').includes(filter["search"]))});
        if (list_sim.length > 0) {  
          page = i
          break;
        } else {
          list_sim = []
        }
        
      }
    }
    
    
  } else {
    const res = await fetch(`${BASE_URL}page_${filter["currentPage"]}.json`);
    sims = await res.json();
    list_sim = sims
  }
  
  // localStorage.setItem(key, JSON.stringify(sims));
  if (list_sim.length > 0) {
    filter["currentPage"] = page
    
    page.innerText = `Trang: ${filter["currentPage"]}`
    
  } else {
    page.innerText = `Không có kết quả nào được tìm thấy`
  }
  render(list_sim);
  
}
async function loadIndex(){
  const key = `index`; 

  const res = await fetch(`${BASE_URL}index.json`);
  const data = await res.json();
  const cache = localStorage.getItem(key);
  filter["pageSize"] = data.pageSize
  filter["total"] = data.total
  filter["totalPage"] = data.totalPages
  if(cache){
    if (cache.version !== data.vesion) {
      localStorage.clear();      
    } else {
      loadPage(filter["currentPage"])
      return;
    }
  }
  localStorage.setItem(key, JSON.stringify(data));
  loadPage(filter["currentPage"])
  
}
async function loadSo(so){
  const res = await fetch(`${BASE_URL}${so}.json`);
  const data = await res.json();
  return data
}


page.innerText = `Trang: ${filter["currentPage"]}`

// btnLuan.addEventListener("click", (e) => {
//   e.preventDefault()
//   console.log('ok')
//   document.getElementById("popup").style.display = "flex";
// })

function openPopup(so){
  document.getElementById("pNumber").innerText = `0${so}`;
  loadSo(so).then(detail => {
    document.getElementById("pDetail").innerHTML = detail.l;
  })
  
  document.getElementById("popup").style.display = "flex";
}
function closePopup(){
  document.getElementById("pNumber").innerText = "";
  document.getElementById("pDetail").innerHTML = "Đang load.....";
  document.getElementById("popup").style.display = "none";
}

btnNext.onclick = ()=>{
  filter["currentPage"] = filter["currentPage"] + 1;
  page.innerText = `Trang: ${filter["currentPage"]}`
  if (filter["search"] || filter["mang"] || filter["menh"]) {
    
    handler_page(200)
  } else {
    
    handler_page(20)
  }
  loadPage(filter["currentPage"]);
};
btnPrev.onclick = ()=>{
    if (filter["currentPage"] > 1) {      
        filter["currentPage"] = filter["currentPage"] - 1;
        page.innerText = `Trang: ${filter["currentPage"]}`
        if (filter["search"] || filter["mang"] || filter["menh"]) {
          
          handler_page(200)
        } else {
          
          handler_page(20)
        }
        loadPage(filter["currentPage"], false);
    }
    
};
function handler_page(page_size) {
  filter["pageSize"] = page_size
  filter["totalPage"] = page_size > 0
    ? Math.ceil(filter.total / page_size)
    : 0
}

function updatePaginationButtons(){
  btnPrev.disabled = filter["currentPage"] <= 1
  btnNext.disabled = filter["currentPage"] >= filter["totalPage"]
}


loadIndex()