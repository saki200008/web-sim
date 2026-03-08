const zaloLink = "https://zalo.me/0900000000"; // ĐỔI SỐ ZALO

// DATA SIM
const BASE_URL = "https://raw.githubusercontent.com/saki200008/sim-data-v1/refs/heads/main/data/"; 
let pageSize;
let total;
let totalPage;
let currentPage = 1;
let sims = [];
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

function render(){
 simList.innerHTML='';
 console.log(menhSelect.value)
 console.log(mangInput.value)
 console.log(searchInput.value)
//  const menhYear = getMenhFromYear(mangInput.value);
 sims.filter( s =>{
  return (!menhSelect.value||s.me===menhSelect.value) &&
         (!mangInput.value||s.ma===mangInput.value) &&
         (!searchInput.value||s.so.replace(/\s/g,'').includes(searchInput.value));
 }).forEach(s =>{
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


menhSelect.onchange = render;
mangInput.oninput = render;
searchInput.oninput = render;
// render();

async function loadPage(page){
  const key = `sim_page_${page}`;
  const cache = localStorage.getItem(key);
  if(cache){
    sims = JSON.parse(cache)
    render();
    return;
  }

  const res = await fetch(`${BASE_URL}page_${page}.json`);
  sims = await res.json();
  localStorage.setItem(key, JSON.stringify(sims));
  render();
}
async function loadIndex(){
  const key = `index`; 

  const res = await fetch(`${BASE_URL}index.json`);
  const data = await res.json();
  const cache = localStorage.getItem(key);
  pageSize = data.pageSize
  total = data.total
  totalPage = data.totalPages
  if(cache){
    if (cache.version !== data.vesion) {
      localStorage.clear();      
    } else {
      loadPage(currentPage)
      return;
    }
  }
  localStorage.setItem(key, JSON.stringify(data));
  loadPage(currentPage)
  
}
async function loadSo(so){
  const res = await fetch(`${BASE_URL}${so}.json`);
  const data = await res.json();
  return data
}


page.innerText = `Trang: ${currentPage}`

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
  currentPage++;
  page.innerText = `Trang: ${currentPage}`
  loadPage(currentPage);
};
btnPrev.onclick = ()=>{
    if (currentPage > 1) {
        currentPage--;
        page.innerText = `Trang: ${currentPage}`
        loadPage(currentPage);
    }
    
};

function updatePaginationButtons(){
  btnPrev.disabled = currentPage <= 1
  btnNext.disabled = currentPage >= totalPage
}


loadIndex()