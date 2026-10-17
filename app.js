"use strict";

const teams = [
  {id:"IND",name:"India",flag:"🇮🇳",group:"A",captain:"Suryakumar Yadav",players:"Suryakumar Yadav|Abhishek Sharma|Tilak Varma|Sanju Samson|Shivam Dube|Ishan Kishan|Hardik Pandya|Arshdeep Singh|Jasprit Bumrah|Harshit Rana|Varun Chakaravarthy|Kuldeep Yadav|Axar Patel|Washington Sundar|Rinku Singh"},
  {id:"AUS",name:"Australia",flag:"🇦🇺",group:"B",captain:"Mitchell Marsh",players:"Mitchell Marsh|Xavier Bartlett|Cooper Connolly|Tim David|Ben Dwarshuis|Cameron Green|Nathan Ellis|Travis Head|Josh Inglis|Matthew Kuhnemann|Glenn Maxwell|Matthew Renshaw|Marcus Stoinis|Adam Zampa|Steve Smith"},
  {id:"ENG",name:"England",flag:"🏴",group:"C",captain:"Harry Brook",players:"Harry Brook|Rehan Ahmed|Jofra Archer|Tom Banton|Jacob Bethell|Jos Buttler|Sam Curran|Liam Dawson|Ben Duckett|Will Jacks|Jamie Overton|Adil Rashid|Phil Salt|Josh Tongue|Luke Wood"},
  {id:"PAK",name:"Pakistan",flag:"🇵🇰",group:"A",captain:"Salman Agha",players:"Salman Agha|Abrar Ahmed|Babar Azam|Faheem Ashraf|Fakhar Zaman|Khawaja Nafay|Mohammad Nawaz|Salman Mirza|Naseem Shah|Sahibzada Farhan|Saim Ayub|Shaheen Afridi|Shadab Khan|Usman Khan|Usman Tariq"},
  {id:"NZ",name:"New Zealand",flag:"🇳🇿",group:"D",captain:"Mitchell Santner",players:"Mitchell Santner|Finn Allen|Mark Chapman|Devon Conway|Jacob Duffy|Lockie Ferguson|Matt Henry|Kyle Jamieson|Daryl Mitchell|James Neesham|Glenn Phillips|Rachin Ravindra|Tim Seifert|Ish Sodhi|Cole McConchie"},
  {id:"SA",name:"South Africa",flag:"🇿🇦",group:"D",captain:"Aiden Markram",players:"Aiden Markram|Corbin Bosch|Dewald Brevis|Quinton de Kock|Marco Jansen|George Linde|Keshav Maharaj|Kwena Maphaka|David Miller|Lungi Ngidi|Anrich Nortje|Kagiso Rabada|Ryan Rickelton|Jason Smith|Tristan Stubbs"},
  {id:"SL",name:"Sri Lanka",flag:"🇱🇰",group:"B",captain:"Dasun Shanaka",players:"Dasun Shanaka|Pathum Nissanka|Kamil Mishara|Kusal Mendis|Kamindu Mendis|Kusal Janith Perera|Charith Asalanka|Janith Liyanage|Pavan Rathnayake|Dushan Hemantha|Dunith Wellalage|Maheesh Theekshana|Dushmantha Chameera|Matheesha Pathirana|Eshan Malinga"},
  {id:"WI",name:"West Indies",flag:"🇯🇲",group:"C",captain:"Shai Hope",players:"Shai Hope|Shimron Hetmyer|Johnson Charles|Roston Chase|Matthew Forde|Jason Holder|Akeal Hosein|Shamar Joseph|Brandon King|Gudakesh Motie|Rovman Powell|Sherfane Rutherford|Quentin Sampson|Jayden Seales|Romario Shepherd"},
  {id:"AFG",name:"Afghanistan",flag:"🇦🇫",group:"D",captain:"Rashid Khan",players:"Rashid Khan|Noor Ahmad|Abdullah Ahmadzai|Sediqullah Atal|Fazalhaq Farooqi|Rahmanullah Gurbaz|Mohammad Ishaq Rahimi|Shahidullah Kamal|Mohammad Nabi|Gulbadin Naib|Azmatullah Omarzai|Mujeeb Ur Rahman|Darwish Rasooli|Ibrahim Zadran|Zia Ur Rahman Sharifi"},
  {id:"USA",name:"United States",flag:"🇺🇸",group:"A",captain:"Monank Patel",players:"Monank Patel|Ehsan Adil|Andries Gous|Shehan Jayasuriya|Milind Kumar|Shayan Jahangir|Saiteja Mukkamala|Sanjay Krishnamurthi|Harmeet Singh|Nosthush Kenjige|Shadley Van Schalkwyk|Saurabh Netravalkar|Ali Khan|Mohammad Mohsin|Shubham Ranjane"},
  {id:"NAM",name:"Namibia",flag:"🇳🇦",group:"A",captain:"Gerhard Erasmus",players:"Gerhard Erasmus|Zane Green|Bernard Scholtz|Ruben Trumpelmann|JJ Smit|Jan Frylinck|Louren Steenkamp|Malan Kruger|Nicol Loftie-Eaton|Jack Brassell|Alex Volschenk|JC Balt|Dylan Leicher|WP Myburgh|Max Heingo"},
  {id:"NED",name:"Netherlands",flag:"🇳🇱",group:"A",captain:"Scott Edwards",players:"Scott Edwards|Colin Ackermann|Noah Croes|Bas de Leede|Aryan Dutt|Fred Klaassen|Kyle Klein|Michael Levitt|Zach Lion-Cachet|Max O'Dowd|Logan van Beek|Timm van der Gugten|Roelof van der Merwe|Paul van Meekeren|Saqib Zulfiqar"},
  {id:"ZIM",name:"Zimbabwe",flag:"🇿🇼",group:"B",captain:"Sikandar Raza",players:"Sikandar Raza|Brian Bennett|Ryan Burl|Graeme Cremer|Ben Curran|Bradley Evans|Clive Madande|Tinotenda Maposa|Tadiwanashe Marumani|Wellington Masakadza|Tony Munyonga|Tashinga Musekiwa|Blessing Muzarabani|Dion Myers|Richard Ngarava"},
  {id:"IRE",name:"Ireland",flag:"🇮🇪",group:"B",captain:"",players:"Mark Adair|Ross Adair|Ben Calitz|Curtis Campher|Gareth Delany|George Dockrell|Matthew Humphreys|Josh Little|Barry McCarthy|Harry Tector|Tim Tector|Lorcan Tucker|Sam Topping|Ben White|Craig Young"},
  {id:"OMA",name:"Oman",flag:"🇴🇲",group:"B",captain:"Jatinder Singh",players:"Jatinder Singh|Vinayak Shukla|Mohammad Nadeem|Shakeel Ahmad|Hammad Mirza|Wasim Ali|Karan Sonavale|Shah Faisal|Nadeem Khan|Sufyan Mehmood|Jay Odedra|Shafiq Jan|Ashish Odedara|Jiten Ramanandi|Aamir Kaleem"},
  {id:"NEP",name:"Nepal",flag:"🇳🇵",group:"C",captain:"Rohit Paudel",players:"Rohit Paudel|Dipendra Singh Airee|Sandeep Lamichhane|Kushal Bhurtel|Aasif Sheikh|Sundeep Jora|Aarif Sheikh|Basir Ahamad|Sompal Kami|Karan KC|Nandan Yadav|Gulshan Jha|Lalit Rajbanshi|Sher Malla|Lokesh Bam"},
  {id:"SCO",name:"Scotland",flag:"🏴",group:"C",captain:"Richie Berrington",players:"Richie Berrington|Tom Bruce|Matthew Cross|Bradley Currie|Oliver Davidson|Chris Greaves|Zainullah Ihsan|Michael Jones|Michael Leask|Finlay McCreath|Brandon McMullen|George Munsey|Jack Jarvis|Mark Watt|Bradley Wheal"},
  {id:"ITA",name:"Italy",flag:"🇮🇹",group:"C",captain:"Wayne Madsen",players:"Wayne Madsen|Marcus Campopiano|Gian Piero Meade|Zain Ali|Ali Hasan|Crishan Jorge Kalugamage|Harry Manenti|Anthony Mosca|Justin Mosca|Syed Naqvi|Benjamin Manenti|Jaspreet Singh|JJ Smuts|Grant Stewart|Thomas Draca"},
  {id:"CAN",name:"Canada",flag:"🇨🇦",group:"D",captain:"Dilpreet Bajwa",players:"Dilpreet Bajwa|Ajayveer Hundal|Ansh Patel|Dilon Heyliger|Harsh Thaker|Jaskarandeep Singh|Kaleem Sana|Kanwarpal Tathgur|Navneet Dhaliwal|Nicholas Kirton|Ravinderpal Singh|Saad Bin Zafar|Shivam Sharma|Shreyas Movva|Yuvraj Samra"},
  {id:"UAE",name:"United Arab Emirates",flag:"🇦🇪",group:"D",captain:"Muhammad Waseem",players:"Muhammad Waseem|Alishan Sharafu|Aryansh Sharma|Dhruv Parashar|Haider Ali|Harshit Kaushik|Junaid Siddique|Mayank Kumar|Muhammad Arfan|Muhammad Farooq|Muhammad Jawadullah|Muhammad Zohaib|Rohid Khan|Sohaib Khan|Simranjeet Singh"}
].map(t=>({...t,players:t.players.split("|")}));

const legendByTeam = {
  IND:["Sachin Tendulkar","MS Dhoni","Virender Sehwag","Yuvraj Singh","Kapil Dev","Anil Kumble","Rahul Dravid"],
  AUS:["Ricky Ponting","Shane Warne","Adam Gilchrist","Glenn McGrath","Steve Waugh","Brett Lee","Michael Bevan"],
  ENG:["Ian Botham","Andrew Flintoff","Kevin Pietersen","James Anderson","Stuart Broad","Alastair Cook"],
  PAK:["Wasim Akram","Waqar Younis","Inzamam-ul-Haq","Shahid Afridi","Shoaib Akhtar","Younis Khan","Javed Miandad"],
  NZ:["Brendon McCullum","Daniel Vettori","Stephen Fleming","Chris Cairns","Ross Taylor","Shane Bond"],
  SA:["AB de Villiers","Jacques Kallis","Dale Steyn","Shaun Pollock","Graeme Smith","Jonty Rhodes"],
  SL:["Kumar Sangakkara","Mahela Jayawardene","Lasith Malinga","Muttiah Muralitharan","Sanath Jayasuriya","Aravinda de Silva"],
  WI:["Brian Lara","Chris Gayle","Viv Richards","Curtly Ambrose","Courtney Walsh","Shivnarine Chanderpaul","Clive Lloyd"],
  ZIM:["Andy Flower","Grant Flower","Heath Streak","Brendan Taylor","Hamilton Masakadza"],
  IRE:["Kevin O'Brien","Ed Joyce","William Porterfield","Niall O'Brien","Boyd Rankin"],
  SCO:["Kyle Coetzer","Calum MacLeod","Preston Mommsen","Majid Haq"],
  NEP:["Paras Khadka","Gyanendra Malla","Sharad Vesawkar"],
  NED:["Ryan ten Doeschate","Peter Borren","Tom Cooper","Pieter Seelaar"],
  NAM:["Rudi van Vuuren","Louis Burger","Craig Williams"],
  CAN:["John Davison","Ashish Bagai","Rizwan Cheema"],
  UAE:["Khurram Khan","Shaiman Anwar","Amjad Javed"]
};

const venues = [
  {"type":"beach","id":"TIDEBREAK_BAY","name":"Tidebreak Bay Beach Ground","city":"Konkan Coast · India","sky":"#85d4e3","sea":"#32aeb9","sand":"#efd19a","hill":"#548c72","sun":"#ffe4a4"},
  {"type":"beach","id":"CORAL_COVE","name":"Coral Cove Arena","city":"Goa · India","sky":"#7bd7e3","sea":"#23aab9","sand":"#f2d39b","hill":"#508d74","sun":"#ffe39d"},
  {"type":"beach","id":"PALM_SHORE","name":"Palm Shore Oval","city":"Kerala · India","sky":"#91d9e6","sea":"#38abb1","sand":"#e8c88d","hill":"#478b70","sun":"#ffe5a4"},
  {"type":"beach","id":"SUNSET_LAGOON","name":"Sunset Lagoon Ground","city":"Indian Ocean","sky":"#edb28a","sea":"#4d9eaa","sand":"#e7c48e","hill":"#4e806a","sun":"#ffe0a0"},
    {type:"green",id:"WANKHEDE",name:"Wankhede Stadium",city:"Mumbai · India",sky:"#87d5ef",sea:"#47b3c0",sand:"#efd09a",hill:"#4c8976",sun:"#ffe5a5"},
  {type:"green",id:"EDEN",name:"Eden Gardens",city:"Kolkata · India",sky:"#91d4ec",sea:"#48b4c1",sand:"#e9c991",hill:"#4b8c76",sun:"#ffe7a7"},
  {type:"green",id:"NARENDRA",name:"Narendra Modi Stadium",city:"Ahmedabad · India",sky:"#9dd5e9",sea:"#4cabb6",sand:"#e7c18b",hill:"#5b8b70",sun:"#ffdfa0"},
  {type:"green",id:"CHIDAMBARAM",name:"M. A. Chidambaram Stadium",city:"Chennai · India",sky:"#80d2e5",sea:"#34abb8",sand:"#f0d39f",hill:"#428b72",sun:"#ffe29d"},
  {type:"green",id:"CHINNASWAMY",name:"M. Chinnaswamy Stadium",city:"Bengaluru · India",sky:"#9bd6e9",sea:"#4aaebb",sand:"#e8cc99",hill:"#548c72",sun:"#ffe2a3"},
  {type:"green",id:"LORDS",name:"Lord’s Cricket Ground",city:"London · England",sky:"#a2d5e6",sea:"#549aa8",sand:"#e2ca9e",hill:"#62836f",sun:"#f8e4b8"},
  {type:"green",id:"OVAL",name:"The Oval",city:"London · England",sky:"#a0d7e6",sea:"#4b9da9",sand:"#e4c99a",hill:"#5f8973",sun:"#f9e5af"},
  {type:"green",id:"MCG",name:"Melbourne Cricket Ground",city:"Melbourne · Australia",sky:"#8bcfe3",sea:"#3c9ead",sand:"#efcf95",hill:"#55816a",sun:"#ffdfa0"},
  {type:"green",id:"SCG",name:"Sydney Cricket Ground",city:"Sydney · Australia",sky:"#90d3e7",sea:"#49aeb8",sand:"#efd19d",hill:"#5a8c73",sun:"#ffe3a4"},
  {type:"green",id:"GADDAFI",name:"Gaddafi Stadium",city:"Lahore · Pakistan",sky:"#a4d3dc",sea:"#508f9b",sand:"#e8c68e",hill:"#6c8564",sun:"#ffe0a4"},
  {type:"green",id:"PREMADASA",name:"R. Premadasa Stadium",city:"Colombo · Sri Lanka",sky:"#7ed2df",sea:"#33a5ac",sand:"#e9c995",hill:"#4b8a68",sun:"#ffe6a4"},
  {type:"green",id:"NEWLANDS",name:"Newlands Cricket Ground",city:"Cape Town · South Africa",sky:"#91cfe0",sea:"#438fa7",sand:"#e4c995",hill:"#71886e",sun:"#fbe2ac"},
  {type:"green",id:"KENSINGTON",name:"Kensington Oval",city:"Bridgetown · Barbados",sky:"#7ed9e4",sea:"#269db1",sand:"#f0d29a",hill:"#4a8d73",sun:"#ffe4a4"},
  {type:"green",id:"BASIN",name:"Basin Reserve",city:"Wellington · New Zealand",sky:"#a6d4e5",sea:"#468ca2",sand:"#e3c998",hill:"#61816c",sun:"#fce7bc"},
  {type:"green",id:"DUBAI",name:"Dubai International Stadium",city:"Dubai · UAE",sky:"#93d0e5",sea:"#3aa9bb",sand:"#efd09a",hill:"#b58c62",sun:"#ffe49c"}
];

const worldLegends = Object.entries(legendByTeam).flatMap(([country,names])=>names.map(name=>({name,country})));
teams.push({id:"LEG",name:"World Legends",flag:"🌍",group:"ALL ERAS",captain:"Ricky Ponting",players:[],worldLegends:true});
teams.push({id:"AUCTION",name:"Tidebreak Auction XI",flag:"🌊",group:"COASTAL LEAGUE",captain:"Auction Captain",players:[],auctionTeam:true});
const teamById = Object.fromEntries(teams.map(team=>[team.id,team]));
const venueById = Object.fromEntries(venues.map(venue=>[venue.id,venue]));
const $ = (selector,root=document)=>root.querySelector(selector);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const randomItem=items=>items[Math.floor(Math.random()*items.length)];
const currentMembers=id=>id==="AUCTION"?(state.auction?.rosters?.[state.auction.clubId]||[]):(teamById[id]?.players||[]).map((name,index)=>({key:`C:${id}:${name}`,name,team:id,era:"current",captain:name===teamById[id]?.captain,order:index+1}));
const legendMembers=id=> id==="LEG" ? worldLegends.map((p,index)=>({key:`L:${p.country}:${p.name}`,name:p.name,team:p.country,era:"legend",country:teamById[p.country]?.name||p.country,flag:teamById[p.country]?.flag||"🌍",order:index+1})) : (legendByTeam[id]||[]).map((name,index)=>({key:`L:${id}:${name}`,name,team:id,era:"legend",country:teamById[id]?.name||id,flag:teamById[id]?.flag||"🌍",order:index+1}));
const membersForTeam=id=>[...currentMembers(id),...legendMembers(id)];
const firstXI=id=>(id==="LEG"?legendMembers(id):currentMembers(id)).slice(0,11);
const auctionClubs=[{id:"CORAL",name:"Coral Kings",flag:"🐚"},{id:"REEF",name:"Reef Rangers",flag:"🪸"},{id:"TIDE",name:"Tidebreak Mariners",flag:"🌊"},{id:"SUNSET",name:"Sunset Strikers",flag:"🌅"}];
const auctionPlayers=Array.from(new Map(teams.filter(t=>t.id!=="LEG"&&t.id!=="AUCTION").flatMap(t=>membersForTeam(t.id)).map(p=>[p.key,p])).values());
const auctionPlayerByKey=Object.fromEntries(auctionPlayers.map(p=>[p.key,p]));

const state={
  sideTeams:["IND","AUS"],
  sideLineups:[firstXI("IND"),firstXI("AUS")],
  overs:5,venue:"TIDEBREAK_BAY",venueType:"beach",squadSide:0,squadPool:"current",game:null,toss:null,
  controls:{mode:"swipe",shotMap:"balanced",sensitivity:1,timingAssist:true,proMode:false,bowlMode:"tap"},
  matchHistory:[],auction:null
};
const SAVE_KEY="tidebreak.local.v1";
const beachArtwork=new Image();
beachArtwork.src="assets/tidebreak-beach-ground.png";
beachArtwork.onload=()=>{drawMenuScene();drawScene();};
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function saveLocalData(){
  try{
    const game=state.game?JSON.parse(JSON.stringify(state.game)):null;
    if(game&&game.status==="live"&&(game.phase==="bat-flight"||game.phase==="bowl-meter"||game.phase==="shot-flight")){
      game.phase="ready";game.delivery=null;game.ballFlight=null;game.event="Match saved. The next delivery is ready.";
    }
    localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,savedAt:new Date().toISOString(),sideTeams:state.sideTeams,sideLineups:state.sideLineups.map(x=>x.map(p=>p.key)),overs:state.overs,venue:state.venue,venueType:state.venueType,game,toss:state.toss,controls:state.controls,matchHistory:state.matchHistory.slice(0,12),auction:state.auction}));
    const badge=$("#save-status");if(badge){badge.textContent="SAVED ON THIS DEVICE";badge.dataset.saved="true";}
  }catch(error){const badge=$("#save-status");if(badge){badge.textContent="LOCAL SAVE UNAVAILABLE";badge.dataset.saved="false";}}
}
function loadLocalData(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);if(!raw)return;
    const saved=JSON.parse(raw);if(saved.version!==1)return;
    if(Array.isArray(saved.sideTeams)&&saved.sideTeams.length===2&&saved.sideTeams.every(id=>teamById[id])&&saved.sideTeams[0]!==saved.sideTeams[1])state.sideTeams=saved.sideTeams;
    if(Array.isArray(saved.sideLineups)&&saved.sideLineups.length===2){
      state.sideLineups=state.sideTeams.map((id,side)=>{
        const valid=(saved.sideLineups[side]||[]).map(key=>membersForTeam(id).find(p=>p.key===key)).filter(Boolean);
        return valid.length===11?valid:firstXI(id);
      });
    }
    if([5,10,20,30,50].includes(Number(saved.overs)))state.overs=Number(saved.overs);
    if(venueById[saved.venue]){state.venue=saved.venue;state.venueType=venueById[saved.venue].type;}
    if(["beach","green"].includes(saved.venueType))state.venueType=saved.venueType;
    if(saved.controls&&typeof saved.controls==="object"){
      if(["swipe","tap"].includes(saved.controls.mode))state.controls.mode=saved.controls.mode;
      if(["tap","swipe"].includes(saved.controls.bowlMode))state.controls.bowlMode=saved.controls.bowlMode;
      if(["balanced","precision","power"].includes(saved.controls.shotMap))state.controls.shotMap=saved.controls.shotMap;
      if(Number.isFinite(Number(saved.controls.sensitivity)))state.controls.sensitivity=clamp(Number(saved.controls.sensitivity),.6,1.6);
      if(typeof saved.controls.timingAssist==="boolean")state.controls.timingAssist=saved.controls.timingAssist;
      if(typeof saved.controls.proMode==="boolean")state.controls.proMode=saved.controls.proMode;
    }
    state.matchHistory=Array.isArray(saved.matchHistory)?saved.matchHistory.slice(0,12):[];
    const auction=saved.auction;
    if(auction&&auctionClubs.some(c=>c.id===auction.clubId)&&Array.isArray(auction.lots)&&auction.lots.every(key=>auctionPlayerByKey[key])&&auction.rosters&&typeof auction.rosters==="object"&&auction.budgets&&typeof auction.budgets==="object"){
      state.auction={...auction,lots:auction.lots.slice(0,auctionPlayers.length),rosters:Object.fromEntries(auctionClubs.map(c=>[c.id,Array.isArray(auction.rosters[c.id])?auction.rosters[c.id].filter(p=>p&&(auctionPlayerByKey[p.key]||auctionPlayerByKey[p.sourceKey])).slice(0,15):[]])),budgets:Object.fromEntries(auctionClubs.map(c=>[c.id,clamp(Number(auction.budgets[c.id])||0,0,100)])),lotIndex:clamp(Number(auction.lotIndex)||0,0,Math.max(0,auction.lots.length-1)),bid:Math.max(0,Number(auction.bid)||0)};
    }
    if(state.auction&&Array.isArray(saved.sideLineups))state.sideTeams.forEach((id,side)=>{if(id==="AUCTION"){const restored=(saved.sideLineups[side]||[]).map(key=>currentMembers("AUCTION").find(p=>p.key===key)).filter(Boolean);state.sideLineups[side]=restored.length===11?restored:firstXI("AUCTION");}});
    const g=saved.game;
    if(g&&Array.isArray(g.teamIds)&&g.teamIds.length===2&&g.teamIds.every(id=>teamById[id])&&venueById[g.venue]&&[5,10,20,30,50].includes(Number(g.overs))&&Array.isArray(g.lineups)&&g.innings){
      state.game=g;
      if(g.status==="live"&&(g.phase==="bat-flight"||g.phase==="bowl-meter"||g.phase==="shot-flight")){g.phase="ready";g.delivery=null;g.ballFlight=null;g.event="The saved match is ready for the next delivery.";}
    }
    if(!state.game&&saved.toss&&["call","choose","result"].includes(saved.toss.phase)&&Array.isArray(saved.toss.teams)&&saved.toss.teams.every(id=>teamById[id]))state.toss=saved.toss;
    const badge=$("#save-status");if(badge){badge.textContent="LOCAL SAVE RESTORED";badge.dataset.saved="true";}
  }catch(error){}
}
function fillSelects(){
  const markup=teams.map(t=>'<option value="'+esc(t.id)+'"'+(t.id==="AUCTION"&&currentMembers("AUCTION").length<11?" disabled":"")+'>'+esc(t.flag)+"  "+esc(t.name)+(t.id==="LEG"?" · Classic stars":t.id==="AUCTION"?" · Auction roster":"")+"</option>").join("");
  $("#team-a-select").innerHTML=markup;$("#team-b-select").innerHTML=markup;
  $("#team-a-select").value=state.sideTeams[0];$("#team-b-select").value=state.sideTeams[1];
}
function renderResumeCard(){
  const card=$("#resume-card"),game=state.game;if(!card)return;
  if(!game){card.hidden=true;card.innerHTML="";return;}
  const a=teamById[game.teamIds[0]],b=teamById[game.teamIds[1]];
  const one=game.inningsScores?.[0]||{runs:game.inningsIndex===0?game.innings.runs:0,wickets:game.inningsIndex===0?game.innings.wickets:0,legal:game.inningsIndex===0?game.innings.legal:0};
  const two=game.inningsIndex===1?game.innings:{runs:0,wickets:0,legal:0};
  const label=game.status==="complete"?"LAST MATCH · FINAL WHISTLE":game.status==="break"?"MATCH SAVED · INNINGS BREAK":"MATCH SAVED · IN PROGRESS";
  card.hidden=false;
  card.innerHTML='<div><span class="eyebrow">'+label+'</span><strong>'+a.flag+" "+esc(a.name)+" "+one.runs+"/"+one.wickets+" <i>·</i> "+b.flag+" "+esc(b.name)+" "+two.runs+"/"+two.wickets+'</strong><small>'+game.overs+" overs · "+esc(venueById[game.venue].name)+(game.result?" · "+esc(game.result):"")+'</small></div><button class="primary-button" data-command="resume">'+(game.status==="complete"?"VIEW RESULT":"RESUME MATCH")+' <span>↗</span></button>';
}
function renderToss(){
  const modal=$("#toss-modal"),toss=state.toss;if(!modal)return;
  if(!toss){modal.hidden=true;return;}
  const [aId,bId]=toss.teams,a=teamById[aId],b=teamById[bId];
  const captainA=a.captain||a.players[0]||"Captain",captainB=b.captain||b.players[0]||"Captain";
  $("#toss-versus").innerHTML='<div class="toss-captain"><span>'+a.flag+'</span><small>'+esc(a.name.toUpperCase())+' · CAPTAIN</small><strong>'+esc(captainA)+'</strong></div><span class="toss-vs">VS</span><div class="toss-captain"><span>'+b.flag+'</span><small>'+esc(b.name.toUpperCase())+' · CAPTAIN</small><strong>'+esc(captainB)+'</strong></div>';
  const coin=$("#toss-coin"),face=$("#toss-coin-face"),heading=$("#toss-heading"),copy=$("#toss-copy"),note=$("#toss-note"),actions=$("#toss-actions");
  coin.classList.toggle("flipping",toss.phase!=="call");face.textContent=toss.coin?toss.coin.toUpperCase():"TOSS";
  if(toss.phase==="call"){
    heading.textContent="Call heads or tails";copy.textContent=captainA+" calls for your side. Make your call, then see which captain wins.";note.textContent="One call · one flip · the winner chooses.";
    actions.innerHTML='<button class="toss-call-button" data-toss-call="heads">HEADS <span>◉</span></button><button class="toss-call-button" data-toss-call="tails">TAILS <span>◉</span></button>';
  }else if(toss.phase==="choose"){
    heading.textContent=captainA+" wins the toss!";copy.textContent="Your captain has the choice. What will you do?";note.textContent="Choose your first innings.";
    actions.innerHTML='<button class="toss-choice-button" data-toss-choice="bat">BAT FIRST <small>Set the target</small></button><button class="toss-choice-button" data-toss-choice="bowl">BOWL FIRST <small>Chase the total</small></button>';
  }else{
    const winner=toss.winner===0?captainA:captainB;
    heading.textContent=teamById[toss.teams[toss.winner]].name+" win the toss";copy.textContent=winner+" elects to "+(toss.choice==="bat"?"bat first":"bowl first")+".";note.textContent="Your match is ready.";
    actions.innerHTML='<button class="primary-button" data-command="start-after-toss">START MATCH <span>↗</span></button>';
  }
  modal.hidden=false;saveLocalData();
}
function renderSetup(){
  $("#team-a-select").value=state.sideTeams[0];$("#team-b-select").value=state.sideTeams[1];
  state.sideTeams.forEach((id,side)=>{
    const team=teamById[id],lineup=state.sideLineups[side],count=$("#xi-"+(side===0?"a":"b")+"-count"),preview=$("#team-"+(side===0?"a":"b")+"-preview");
    count.textContent=lineup.length+"/11";
    const total=id==="LEG"?legendMembers(id).length:team.players.length;
    const summary=id==="AUCTION"?total+" purchased players · "+(state.auction?auctionClubById(state.auction.clubId).name:"auction mode"):id==="LEG"?total+" all-time greats · international squads available too":"ICC 2026 group "+team.group+" · "+total+" current squad players";
    const auctionOption=$("#team-"+(side===0?"a":"b")+"-select").querySelector('option[value="AUCTION"]');if(auctionOption)auctionOption.disabled=currentMembers("AUCTION").length<11;
    preview.innerHTML='<span class="team-flag">'+team.flag+'</span><span><strong>'+esc(team.name)+'</strong><small>'+esc(summary)+'</small></span>';
  });
  $("#venue-type-options").innerHTML=[["beach","BEACH GROUNDS","🌊"],["green","GREEN STADIUMS","🏟️"]].map(([type,label,icon])=>'<button class="venue-type-button" data-venue-type="'+type+'" aria-pressed="'+(state.venueType===type)+'"><span>'+icon+'</span> '+label+' <small>'+venues.filter(v=>v.type===type).length+'</small></button>').join("");
  $("#venue-grid").innerHTML=venues.filter(v=>v.type===state.venueType).map(v=>'<button class="venue-option '+v.type+'" data-venue="'+v.id+'" aria-pressed="'+(v.id===state.venue)+'"><strong>'+esc(v.name)+'</strong><span class="venue-type-label">'+(v.type==="beach"?"BEACH GROUND":"GREEN STADIUM")+'</span><span>'+esc(v.city)+'</span>'+(v.id===state.venue?"<b>✓</b>":"")+"</button>").join("");
  $("#over-options").innerHTML=[5,10,20,30,50].map(n=>'<button class="choice-button" data-overs="'+n+'" aria-pressed="'+(n===state.overs)+'">'+n+" overs</button>").join("");
  const tossInfo=$("#setup-toss-preview");
  if(tossInfo){const caps=state.sideTeams.map(id=>id==="AUCTION"?(currentMembers(id).find(p=>p.captain)?.name||currentMembers(id)[0]?.name||"Auction Captain"):(teamById[id].captain||teamById[id].players[0]||"Captain"));tossInfo.innerHTML="<strong>"+esc(caps[0])+" <span>vs</span> "+esc(caps[1])+'</strong><small>Heads or tails · toss winner chooses bat or bowl</small>';}
  $("#setup-error").textContent="";
  renderResumeCard();saveLocalData();
}
function setTeam(side,id){
  if(!teamById[id])return;
  state.sideTeams[side]=id;state.sideLineups[side]=firstXI(id);state.toss=null;
  renderSetup();
}
function openSquads(side){
  state.squadSide=Number.isInteger(side)?side:0;
  state.squadPool=state.sideTeams[state.squadSide]==="LEG"?"legends":"current";
  $("#squad-modal").hidden=false;renderSquads();
}
function renderSquads(){
  const side=state.squadSide,active=teamById[state.sideTeams[side]];
  $("#squad-title").textContent=active.flag+" "+active.name+" · Playing XI";
  $("#squad-side-options").innerHTML=[0,1].map(s=>'<button class="squad-tab" data-squad-side="'+s+'" aria-pressed="'+(s===side)+'">'+(s===0?"Your side":"Opposition")+" · "+teamById[state.sideTeams[s]].flag+"</button>").join("");
  const hasCurrent=currentMembers(active.id).length>0,hasLegends=legendMembers(active.id).length>0;
  if(!hasCurrent)state.squadPool="legends";
  $("#squad-pool-options").innerHTML=(hasCurrent?'<button class="pool-tab" data-squad-pool="current" aria-pressed="'+(state.squadPool==="current")+'">CURRENT · ICC 2026</button>':"")+(hasLegends?'<button class="pool-tab" data-squad-pool="legends" aria-pressed="'+(state.squadPool==="legends")+'">LEGENDS · ALL ERAS</button>':"");
  const pool=state.squadPool==="current"?currentMembers(active.id):legendMembers(active.id);
  const chosen=new Set(state.sideLineups[side].map(p=>p.key));
  $("#squad-explainer").textContent=active.id==="AUCTION"?"Your local auction purchases. Choose 11 for the match.":state.squadPool==="current"?"Updated international squad. Select 11 for this match.":active.id==="LEG"?"Pick a World Legends XI from greats across international cricket history.":"Retired greats are extra roster choices; combine them with current players to make your XI.";
  $("#squad-list").innerHTML=pool.length?pool.map((p,i)=>{
    const selected=chosen.has(p.key),n=state.sideLineups[side].findIndex(x=>x.key===p.key)+1;
    const desc=p.era==="legend"&&active.id==="LEG"?p.flag+" "+p.country+" · LEGEND":p.era==="legend"?"RETRO LEGEND":"2026 SQUAD · "+String(i+1).padStart(2,"0");
    return '<div class="player-row"><button class="player-option" data-player-key="'+esc(p.key)+'" aria-pressed="'+selected+'"><span class="player-check">'+(selected?"✓":"")+'</span><span class="player-info"><strong>'+esc(p.name)+(p.captain?" · CAPTAIN":"")+'</strong><small>'+esc(desc)+'</small></span><span class="player-era">'+(selected?"XI "+n:p.era.toUpperCase())+'</span></button><button class="player-profile-button" data-profile-key="'+esc(p.key)+'" aria-label="View Tidebreak gameplay profile for '+esc(p.name)+'">PROFILE</button></div>';
  }).join(""):'<div class="empty-roster"><strong>No legends listed.</strong><span>Choose World Legends to select from the international all-time pool.</span></div>';
  const n=state.sideLineups[side].length;
  $("#squad-count-note").textContent=n+" of 11 selected · "+active.name;
  $("#save-squads").disabled=n!==11;
}
function togglePlayer(key){
  const side=state.squadSide,lineup=state.sideLineups[side],at=lineup.findIndex(p=>p.key===key);
  if(at>=0)lineup.splice(at,1);
  else{
    if(lineup.length>=11){showToast("Your playing XI already has 11 players.");return;}
    const p=membersForTeam(state.sideTeams[side]).find(p=>p.key===key);if(p)lineup.push(p);
  }
  renderSquads();renderSetup();
}
function closeSquads(){$("#squad-modal").hidden=true;renderSetup();}

function playerProfile(player){
  let hash=2166136261;for(const ch of String(player.sourceKey||player.key)){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
  const n=hash>>>0,roles=["Top-order batter","Power hitter","Batting all-rounder","Fast bowler","Spin bowler","Wicketkeeper-batter"],role=roles[n%roles.length];
  const batting=58+(n%39),power=55+((n>>>5)%44),control=57+((n>>>10)%42),fielding=55+((n>>>15)%44);
  const bowling=(role==="Fast bowler"||role==="Spin bowler"||role==="Batting all-rounder")?62+((n>>>20)%35):32+((n>>>20)%43);
  const speed=role==="Fast bowler"?128+((n>>>8)%21):role==="Spin bowler"?72+((n>>>8)%36):null;
  const hand=(n&1)?"Right-hand":"Left-hand",style=role==="Fast bowler"?"Seam attack":role==="Spin bowler"?"Flight & turn":role==="Batting all-rounder"?"Bat and bowl":role==="Wicketkeeper-batter"?"Keeper-batter":power>82?"Boundary hitter":"Placement batter";
  const overall=Math.round((batting+power+control+fielding+bowling)/5);
  return {role,batting,power,control,fielding,bowling,speed,hand,style,overall};
}
function findPlayer(key){if(auctionPlayerByKey[key])return auctionPlayerByKey[key];for(const roster of Object.values(state.auction?.rosters||{})){const player=roster.find(p=>p.key===key);if(player)return player;}return null;}
function profileMeter(label,value){return '<div class="profile-meter"><span>'+label+'</span><b>'+value+'</b><i><em style="width:'+value+'%"></em></i></div>';}
function renderProfile(key){
  const p=findPlayer(key);if(!p)return;
  const ratings=playerProfile(p),team=teamById[p.sourceTeam||p.team],origin=p.era==="legend"?"LEGEND ERA":"INTERNATIONAL ROSTER";
  $("#profile-title").textContent=p.name;
  $("#profile-detail").innerHTML='<div class="profile-identity"><span class="profile-flag">'+esc(team?.flag||"🌍")+'</span><div><strong>'+esc(team?.name||p.country||"International")+'</strong><small>'+origin+' · TIDEBREAK GAME PROFILE</small></div><b class="profile-overall">'+ratings.overall+'<small>OVR</small></b></div><div class="profile-archetype"><span>GAME ROLE</span><strong>'+ratings.role+'</strong><small>'+ratings.hand+' · '+ratings.style+'</small></div><div class="profile-ratings">'+profileMeter("Batting",ratings.batting)+profileMeter("Power",ratings.power)+profileMeter("Control",ratings.control)+profileMeter("Bowling",ratings.bowling)+profileMeter("Fielding",ratings.fielding)+'</div><div class="profile-speed"><span>SIMULATION DELIVERY BAND</span><strong>'+(ratings.speed?ratings.speed+" km/h":"Varied · role balanced")+'</strong></div><p class="profile-disclaimer">These Tidebreak gameplay ratings and speed bands are generated for game balance. They are not official player statistics or measured real-world speeds.</p>';
  $("#profile-modal").hidden=false;
}
function closeProfile(){$("#profile-modal").hidden=true;}
function auctionClubById(id){return auctionClubs.find(c=>c.id===id)||auctionClubs[0];}
function auctionRoster(){return state.auction?.rosters?.[state.auction.clubId]||[];}
function auctionCurrentPlayer(){
  const a=state.auction;if(!a||!Array.isArray(a.lots))return null;
  return auctionPlayerByKey[a.lots[a.lotIndex]]||null;
}
function auctionBasePrice(player){
  return Math.max(.5,Math.round((playerProfile(player).overall-48)/10*2)/2);
}
function auctionCostLabel(amount){return "₹"+Number(amount||0).toFixed(1)+" Cr";}
function renderAuction(){
  const a=state.auction,active=!!a,clubSelect=$("#auction-club-select"),start=$("#auction-start-panel"),board=$("#auction-board");
  clubSelect.innerHTML=auctionClubs.map(c=>'<option value="'+c.id+'">'+c.flag+" "+esc(c.name)+"</option>").join("");
  clubSelect.value=active?a.clubId:clubSelect.value||auctionClubs[0].id;
  start.hidden=active;board.hidden=!active;
  if(!active)return;
  const lot=auctionCurrentPlayer(),club=auctionClubById(a.clubId),profile=lot?playerProfile(lot):null;
  const progress=Math.min(a.lotIndex+1,a.lots.length);
  $("#auction-club-name").textContent=club.flag+" "+club.name;
  $("#auction-budget").textContent=auctionCostLabel(a.budgets[a.clubId]);
  $("#auction-progress").textContent="LOT "+String(progress).padStart(3,"0")+" / "+a.lots.length;
  $("#auction-squad-count").textContent=(a.rosters[a.clubId]||[]).length+" / 15 players";
  $("#auction-rivals").innerHTML=auctionClubs.filter(c=>c.id!==a.clubId).map(c=>'<span>'+c.flag+" "+esc(c.name)+'<b>'+auctionCostLabel(a.budgets[c.id])+'</b></span>').join("");
  $("#auction-message").textContent=a.message||"Bid for a player, then confirm the hammer.";
  if(lot&&profile){
    $("#auction-lot").innerHTML='<div class="auction-lot-top"><span>'+esc(teamById[lot.team]?.flag||lot.flag||"🌍")+' '+esc(teamById[lot.team]?.name||lot.country||"International")+' · '+(lot.era==="legend"?"LEGEND ERA":"CURRENT ERA")+'</span><button class="player-profile-button" data-profile-key="'+esc(lot.key)+'">FULL PROFILE</button></div><h3>'+esc(lot.name)+'</h3><div class="auction-player-tags"><span>'+profile.role+'</span><span>'+profile.overall+' OVR</span><span>GAME TUNING</span></div><div class="auction-price-row"><span>BASE PRICE <b>'+auctionCostLabel(auctionBasePrice(lot))+'</b></span><span>TOP BID <b>'+auctionCostLabel(a.bid)+'</b></span><span>LEADER <b>'+(a.highBidder?esc(auctionClubById(a.highBidder).name):"—")+'</b></span></div>';
  }else $("#auction-lot").innerHTML='<h3>All available lots completed</h3>';
  const nextBid=a.bid>0?a.bid+.5:lot?auctionBasePrice(lot):0;
  $("#auction-bid-button").textContent="BID "+auctionCostLabel(nextBid);
  $("#auction-bid-button").disabled=!lot||a.status!=="open"||a.lotClosed||nextBid>a.budgets[a.clubId];
  $("#auction-hammer-button").textContent=a.status==="complete"?"AUCTION COMPLETE":a.lotClosed?"NEXT LOT":a.highBidder===a.clubId?"HAMMER · BUY PLAYER":"PASS · HAMMER";
  $("#auction-hammer-button").disabled=a.status==="complete";
  $("#use-auction-xi").disabled=(a.rosters[a.clubId]||[]).length<11;
}
function openAuction(){renderAuction();$("#auction-modal").hidden=false;}
function startAuction(clubId){
  if(state.sideTeams.includes("AUCTION")){showToast("Switch your match side away from Tidebreak Auction XI before starting a new auction.");return;}
  const club=auctionClubs.some(c=>c.id===clubId)?clubId:auctionClubs[0].id;
  const lots=auctionPlayers.map(p=>p.key);for(let i=lots.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[lots[i],lots[j]]=[lots[j],lots[i]];}
  state.auction={clubId:club,budgets:Object.fromEntries(auctionClubs.map(c=>[c.id,100])),rosters:Object.fromEntries(auctionClubs.map(c=>[c.id,[]])),lots:lots.slice(0,100),lotIndex:0,bid:0,highBidder:null,lotClosed:false,status:"open",message:"Auction opened. Build a squad of up to 15 players; 11 can enter a match."};
  fillSelects();renderSetup();renderAuction();saveLocalData();
}
function auctionBid(){
  const a=state.auction,lot=auctionCurrentPlayer();if(!a||!lot||a.status!=="open"||a.lotClosed)return;
  const amount=a.bid>0?a.bid+.5:auctionBasePrice(lot);if(amount>a.budgets[a.clubId]){showToast("That bid is above your remaining purse.");return;}
  a.bid=amount;a.highBidder=a.clubId;
  const rating=playerProfile(lot).overall;
  const interested=auctionClubs.filter(c=>c.id!==a.clubId&&a.budgets[c.id]>=amount+.5&&(a.rosters[c.id]||[]).length<15);
  if(interested.length&&Math.random()<.13+Math.max(0,rating-60)/150){
    const rival=randomItem(interested);a.bid=Math.min(amount+.5,a.budgets[rival.id]);a.highBidder=rival.id;
    a.message=rival.name+" has raised the paddle. Bid again or let the lot go.";
  }else a.message="You are leading at "+auctionCostLabel(a.bid)+". Lock in the player or raise the paddle.";
  renderAuction();saveLocalData();
}
function advanceAuction(){
  const a=state.auction;if(!a)return;
  if(a.lotIndex>=a.lots.length-1){a.status="complete";a.message="The available player lots are complete.";return;}
  a.lotIndex++;a.bid=0;a.highBidder=null;a.lotClosed=false;a.message="Next player is on the block.";
}
function auctionHammer(){
  const a=state.auction;if(!a||a.status==="complete")return;
  if(a.lotClosed){advanceAuction();renderAuction();saveLocalData();return;}
  const lot=auctionCurrentPlayer();
  if(a.highBidder&&lot){
    const buyer=a.highBidder,amount=a.bid;
    if(a.budgets[buyer]<amount||a.rosters[buyer].length>=15){a.message="Bid could not be settled; the lot is unsold.";a.highBidder=null;a.bid=0;}
    else{
      a.budgets[buyer]=Math.max(0,a.budgets[buyer]-amount);a.rosters[buyer].push({...lot,key:"AUC:"+buyer+":"+lot.key,sourceKey:lot.key,sourceTeam:lot.team,team:"AUCTION",auctionClub:buyer});
      a.message=auctionClubById(buyer).name+" signs "+lot.name+" for "+auctionCostLabel(amount)+".";
    }
  }else a.message="No bid. The player goes unsold.";
  if(a.rosters[a.clubId].length>=15||a.lotIndex>=a.lots.length-1)a.status="complete";
  else a.lotClosed=true;
  renderAuction();saveLocalData();
}
function closeAuction(){$("#auction-modal").hidden=true;saveLocalData();renderSetup();}
function showToast(message){
  const toast=$("#toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}
function teamColor(id){
  const colors={IND:"#287cb5",AUS:"#d6aa31",ENG:"#4595c3",PAK:"#31855c",NZ:"#263640",SA:"#4a9d68",SL:"#e2b92b",WI:"#765392",AFG:"#3777ac",USA:"#ca5662",NAM:"#326da4",NED:"#dc7746",ZIM:"#589064",IRE:"#5b9e65",OMA:"#bc3c41",NEP:"#dc545f",SCO:"#477ec3",ITA:"#5eaa79",CAN:"#e64f59",UAE:"#3c875f",LEG:"#bf8a4e"};
  return colors[id]||"#458d91";
}
function makeInnings(battingSide,target){
  const game=state.game,bat=game.lineups[battingSide],bowl=game.lineups[1-battingSide];
  return {battingSide,bowlingSide:1-battingSide,target,runs:0,wickets:0,legal:0,lineup:bat,batStats:Object.fromEntries(bat.map(p=>[p.key,{runs:0,balls:0,fours:0,sixes:0,out:false}])),bowlStats:Object.fromEntries(bowl.map(p=>[p.key,{runs:0,wickets:0,balls:0}])),strikerIndex:0,nonStrikerIndex:1,nextBatter:2};
}
function formatOvers(legal){return Math.floor(legal/6)+"."+(legal%6);}
function currentBowler(inn){
  inn=inn||state.game?.innings;if(!inn)return null;
  const xi=state.game.lineups[inn.bowlingSide];return xi[(4+Math.floor(inn.legal/6))%xi.length];
}
function currentStriker(inn){return (inn||state.game?.innings)?.lineup[(inn||state.game.innings).strikerIndex];}
function currentNonStriker(inn){return (inn||state.game?.innings)?.lineup[(inn||state.game.innings).nonStrikerIndex];}
function inningsSnapshot(inn){return {runs:inn.runs,wickets:inn.wickets,legal:inn.legal,battingSide:inn.battingSide,batStats:inn.batStats,bowlStats:inn.bowlStats};}
function tossOpen(){
  if(state.sideTeams[0]===state.sideTeams[1]){$("#setup-error").textContent="Choose two different sides to start the match.";return;}
  if(state.sideLineups.some(x=>x.length!==11)){$("#setup-error").textContent="Select exactly 11 players for each playing XI.";return;}
  $("#setup-error").textContent="";state.toss={teams:state.sideTeams.slice(),phase:"call",call:null,coin:null,winner:null,choice:null};renderToss();
}
function resolveTossCall(call){
  if(!state.toss||state.toss.phase!=="call")return;
  const coin=Math.random()<.5?"heads":"tails",winner=coin===call?0:1;
  state.toss.call=call;state.toss.coin=coin;state.toss.winner=winner;
  if(winner===0)state.toss.phase="choose";
  else{state.toss.phase="result";state.toss.choice=Math.random()<.5?"bat":"bowl";}
  renderToss();
}
function chooseTossDecision(choice){
  if(!state.toss||state.toss.phase!=="choose")return;
  state.toss.choice=choice;state.toss.phase="result";renderToss();
}
function beginMatch(){
  const toss=state.toss;if(!toss||!toss.choice)return;
  const first=toss.choice==="bat"?toss.winner:1-toss.winner;
  state.game={teamIds:state.sideTeams.slice(),lineups:state.sideLineups.map(x=>x.map(p=>({...p}))),overs:state.overs,venue:state.venue,firstBatting:first,inningsIndex:0,inningsScores:[],firstScore:null,status:"live",phase:"ready",bowlType:"pace",bowlLength:"good",event:"The teams are out on the sand. Call the first delivery.",delivery:null,result:null};
  state.game.innings=makeInnings(first,null);state.toss=null;renderToss();
  $("#setup-screen").hidden=true;$("#game-screen").hidden=false;renderMatch();window.scrollTo({top:0,behavior:"smooth"});
}
function startDelivery(){
  const game=state.game;if(!game||game.status!=="live")return;
  game.startedAt=performance.now();
  game.delivery={line:randomItem(["outside off","on the stumps","short","full"]),duration:2350,target:1550+Math.random()*450};
  game.ballFlight=null;game.phase=game.innings.battingSide===0?"bat-flight":"bowl-meter";renderMatch();
  const active=game;
  setTimeout(()=>{if(state.game!==active)return;if(active.phase==="bat-flight")playShot("defend",performance.now()-active.startedAt);else if(active.phase==="bowl-meter")releaseBowl();},game.delivery.duration+550);
}
function endInnings(game){
  const inn=game.innings,snap=inningsSnapshot(inn);game.inningsScores[game.inningsIndex]=snap;
  if(game.inningsIndex===0){
    game.firstScore=snap;game.status="break";game.phase="result";game.delivery=null;
    game.event=teamById[game.teamIds[inn.battingSide]].name+" finish on "+snap.runs+"/"+snap.wickets+". "+teamById[game.teamIds[1-inn.battingSide]].name+" need "+(snap.runs+1)+" to win.";
  }else{
    game.status="complete";game.phase="result";game.delivery=null;
    const target=game.firstScore.runs+1,batting=teamById[game.teamIds[inn.battingSide]],defending=teamById[game.teamIds[inn.bowlingSide]];
    game.result=inn.runs>=target?batting.name+" win by "+(10-inn.wickets)+" wickets":inn.runs===game.firstScore.runs?"Match tied":defending.name+" win by "+(target-1-inn.runs)+" runs";
    game.event=game.result;state.matchHistory.unshift({result:game.result,teamNames:game.teamIds.map(id=>teamById[id].name),scores:game.inningsScores.map(x=>({runs:x.runs,wickets:x.wickets})),overs:game.overs,venue:venueById[game.venue].name,playedAt:new Date().toISOString()});state.matchHistory=state.matchHistory.slice(0,12);
  }
}
function recordBall(runs,isOut,quality,trajectory){
  const game=state.game,inn=game.innings,batter=currentStriker(inn),bowler=currentBowler(inn),bs=inn.batStats[batter.key],ws=inn.bowlStats[bowler.key];
  bs.balls++;ws.balls++;ws.runs+=runs;inn.runs+=runs;bs.runs+=runs;
  if(runs===4)bs.fours++;if(runs===6)bs.sixes++;
  if(isOut){bs.out=true;inn.wickets++;ws.wickets++;if(inn.nextBatter<inn.lineup.length){inn.strikerIndex=inn.nextBatter;inn.nextBatter++;}}
  else if(runs%2===1)[inn.strikerIndex,inn.nonStrikerIndex]=[inn.nonStrikerIndex,inn.strikerIndex];
  inn.legal++;
  if(inn.legal%6===0)[inn.strikerIndex,inn.nonStrikerIndex]=[inn.nonStrikerIndex,inn.strikerIndex];
  const shotText=isOut?"OUT! The "+randomItem(["keeper","fielder","bowler"])+" takes it cleanly.":runs===6?"SIX! It clears the rope.":runs===4?"FOUR! A clean strike into the boundary.":runs===0?"Dot ball. Good line on the sand.":runs+" run"+(runs===1?"":"s")+" taken.";
  game.event=shotText;game.delivery=null;
  const inningsEnded=(inn.target!==null&&inn.runs>=inn.target)||inn.legal>=game.overs*6||inn.wickets>=10;
  if(inningsEnded){game.phase="result";game.ballFlight=null;endInnings(game);}
  else{
    game.phase="shot-flight";
    const action=trajectory||{};
    game.ballFlight={startedAt:performance.now(),duration:action.loft?1200:950,angle:Number.isFinite(action.angle)?action.angle:-Math.PI/2,loft:Boolean(action.loft),runs,isOut:Boolean(isOut),quality};
    setTimeout(()=>{if(state.game===game&&game.phase==="shot-flight"){game.phase="result";game.ballFlight=null;renderMatch();}},game.ballFlight.duration);
  }
  renderMatch();
}
function playShot(action,elapsed){
  const game=state.game,inn=game.innings,d=game.delivery;if(!game||game.phase!=="bat-flight"||!d)return;
  const window=state.controls.proMode?590:state.controls.timingAssist?1050:850;
  const timing=clamp(1-Math.abs(elapsed-d.target)/window,0,1);
  const fitting={"outside off":["drive","cut"],"on the stumps":["drive","defend"],short:["cut","defend"],full:["drive","loft"]}[d.line]||[];
  const fit=fitting.includes(action),assist=state.controls.timingAssist&&!state.controls.proMode;
  const boost=(state.controls.shotMap==="precision"&&fit?.08:0)+(state.controls.shotMap==="power"&&action==="loft"?.07:0);
  const quality=clamp(timing*(fit?1+(state.controls.shotMap==="precision"?.08:0):assist?.66:.42)+boost,0,1);
  const wicketChance=(quality>.78?.035:quality>.45?.09:quality>.18?.17:.25)+(state.controls.proMode?.045:0);
  const runs=weightedRun(quality>.76?[[0,.20],[1,.23],[2,.17],[3,.04],[4,.26],[6,.10]]:quality>.4?[[0,.28],[1,.38],[2,.16],[3,.03],[4,.12],[6,.03]]:[[0,.46],[1,.35],[2,.10],[3,.02],[4,.06],[6,.01]]);
  recordBall(runs,Math.random()<wicketChance,quality,{angle:({drive:-Math.PI/2,cut:-2.55,loft:-.82,defend:-1.78})[action]??-Math.PI/2,loft:action==="loft"||quality>.86&&action!=="defend"});
}
function releaseBowl(){
  const game=state.game;if(!game||game.phase!=="bowl-meter")return;
  const elapsed=performance.now()-game.startedAt,accuracy=clamp(1-Math.abs(elapsed-game.delivery.target)/(state.controls.proMode?650:1000),0,1);
  const lineFit=game.bowlType==="spin"?.02:0,lengthFit=game.bowlLength==="good"?.04:game.bowlLength==="yorker"?.06:0;
  const wicket=Math.random()<(accuracy>.75?.16:accuracy>.4?.09:.04)+lineFit+lengthFit;
  const runs=weightedRun(accuracy>.7?[[0,.38],[1,.36],[2,.13],[4,.10],[6,.03]]:[[0,.28],[1,.42],[2,.18],[4,.10],[6,.02]]);
  recordBall(runs,wicket,accuracy,{angle:randomItem([-2.65,-2.05,-1.45,-.85]),loft:runs===6});
}
function startChase(){
  const game=state.game;if(!game||game.status!=="break")return;
  game.inningsIndex=1;game.innings=makeInnings(1-game.firstScore.battingSide,game.firstScore.runs+1);game.status="live";game.phase="ready";game.bowlType="pace";game.bowlLength="good";game.event="The chase is on. Target "+(game.firstScore.runs+1)+".";renderMatch();
}
function inningsScore(index){
  const g=state.game;if(!g)return {runs:0,wickets:0,legal:0};
  if(g.inningsScores[index])return g.inningsScores[index];
  if(g.inningsIndex===index)return g.innings;
  return {runs:0,wickets:0,legal:0};
}
function renderControls(){
  const game=state.game,root=$("#play-controls");if(!game||!root)return;
  const inn=game.innings,userBat=inn.battingSide===0,striker=currentStriker(inn),bowler=currentBowler(inn);
  if(game.status==="break"){
    root.innerHTML='<div class="play-overline">INNINGS BREAK</div><h2>'+esc(game.event)+'</h2><p>The teams swap ends. The chase begins with a new ball.</p><button class="primary-button" data-command="start-chase">START THE CHASE <span>↗</span></button>';return;
  }
  if(game.status==="complete"){
    root.innerHTML='<div class="play-overline">FULL TIME · RESULT</div><h2>'+esc(game.result||"Match complete")+'</h2><p>'+esc(game.event)+'</p><div class="control-actions"><button class="primary-button" data-command="rematch">REMATCH · NEW TOSS <span>↗</span></button><button class="text-button" data-command="home">BACK TO SETUP</button></div>';return;
  }
  if(game.phase==="bat-flight"){
    root.innerHTML='<div class="play-overline">YOUR SIDE BATTING · '+esc(striker?.name||"Batter")+' ON STRIKE · '+(state.controls.proMode?"PRO MODE":"SWIPE BATTING")+'</div><h2>'+(state.controls.mode==="swipe"?"Swipe in a direction and release before contact.":"Watch the ball and tap a shot.")+'</h2><p>The ball is on its way from '+esc(bowler?.name||"the bowler")+'. '+(state.controls.mode==="swipe"?"Swipe in a direction to choose your shot.":"Tap a shot control to respond.")+'</p><div class="shot-grid">'+[["drive","Drive","→"],["loft","Loft","↑"],["cut","Cut","←"],["defend","Defend","↓"]].map(x=>'<button class="shot-button" data-shot="'+x[0]+'">'+x[1]+'<b>'+(state.controls.mode==="swipe"?"SWIPE ":"TAP ")+x[2]+'</b></button>').join("")+'</div><div class="next-ball-row"><span class="hot-key">'+state.controls.shotMap.toUpperCase()+" SHOT MAP · BALL "+(inn.legal+1)+'</span><span class="hot-key">SENSITIVITY '+state.controls.sensitivity.toFixed(1)+'×</span></div>';
    return;
  }
  if(game.phase==="shot-flight"){
    root.innerHTML='<div class="play-overline">BALL IN PLAY · '+formatOvers(inn.legal)+' OVERS</div><h2>Follow the shot into the field.</h2><p>'+esc(game.event)+' · '+inn.runs+'/'+inn.wickets+'</p>';return;
  }
  if(game.phase==="bowl-meter"){
    root.innerHTML='<div class="play-overline">YOUR SIDE BOWLING · '+esc(bowler?.name||"Bowler")+'</div><h2>Pick the ball. Time the release.</h2><p>Choose a style and length, then '+(state.controls.bowlMode==="swipe"?"flick the pitch":"tap the release button")+' near the sweet spot.</p><div class="bowl-options"><button class="settings-option" data-bowl-type="pace" aria-pressed="'+(game.bowlType==="pace")+'">PACE</button><button class="settings-option" data-bowl-type="spin" aria-pressed="'+(game.bowlType==="spin")+'">SPIN</button><button class="settings-option" data-bowl-length="good" aria-pressed="'+(game.bowlLength==="good")+'">GOOD LENGTH</button><button class="settings-option" data-bowl-length="yorker" aria-pressed="'+(game.bowlLength==="yorker")+'">YORKER</button></div><button class="primary-button" data-command="release-bowl">RELEASE DELIVERY <span>↗</span></button>';return;
  }
  if(game.phase==="result"){
    root.innerHTML='<div class="play-overline">'+(userBat?"YOUR SIDE BATTING":"YOUR SIDE BOWLING")+' · '+formatOvers(inn.legal)+' OVERS</div><h2>'+esc(game.event)+'</h2><p>Score: '+inn.runs+'/'+inn.wickets+' · '+formatOvers(inn.legal)+' overs</p><button class="primary-button" data-command="next-ball">NEXT BALL <span>↗</span></button>';return;
  }
  root.innerHTML='<div class="play-overline">'+(userBat?"YOUR SIDE BATTING":"YOUR SIDE BOWLING")+' · '+esc(striker?.name||"Ready")+' ON STRIKE</div><h2>Set yourself on the sand.</h2><p>Call the next delivery at Wankhede beach.</p><button class="primary-button" data-command="launch">BOWL NEXT DELIVERY <span>↗</span></button><div class="next-ball-row"><span class="hot-key">BALL '+(inn.legal+1)+'</span><span class="hot-key">'+formatOvers(inn.legal)+' OVERS</span></div>';
}
function renderScorecard(){
  const game=state.game,inn=game.innings,batSide=teamById[game.teamIds[inn.battingSide]],bowlSide=teamById[game.teamIds[inn.bowlingSide]];
  const rows=inn.lineup.map(p=>{const s=inn.batStats[p.key]||{runs:0,balls:0,out:false};return "<tr><td>"+esc(p.name)+(s.out?" <small>out</small>":"")+"</td><td>"+s.runs+"</td><td>"+s.balls+"</td></tr>";}).join("");
  const bowl=currentBowler(inn),bs=bowl?inn.bowlStats[bowl.key]:{balls:0,runs:0,wickets:0};
  $("#scorecard").innerHTML='<div class="scorecard-head"><span class="eyebrow">LIVE SCORECARD</span><strong>'+batSide.flag+" "+esc(batSide.name)+" · "+inn.runs+"/"+inn.wickets+'</strong><small>'+formatOvers(inn.legal)+' overs'+(inn.target!==null?" · target "+inn.target:"")+'</small></div><div class="scorecard-current"><span>STRIKER</span><strong>'+esc(currentStriker(inn)?.name||"—")+'</strong><span>'+esc(bowlSide.name)+" bowling</span><strong>"+esc(bowl?.name||"—")+" "+bs.wickets+"/"+bs.runs+" ("+formatOvers(bs.balls)+")</strong></div><div class=\"scorecard-table-wrap\"><table class=\"scorecard-table\"><thead><tr><th>BATTER</th><th>R</th><th>B</th></tr></thead><tbody>"+rows+"</tbody></table></div>";
}
function syncSwipeHint(){
  const hint=$("#swipe-hint");if(hint)hint.hidden=!(state.game?.status==="live"&&state.game.phase==="bat-flight"&&state.controls.mode==="swipe");
  const help=$("#control-help");if(help)help.textContent=state.controls.mode==="swipe"?"Swipe on the pitch to choose a shot · time it as the ball arrives.":"Tap a shot when the ball reaches the batter · keys 1–4 also work.";
}
function renderMatch(){
  const game=state.game;if(!game)return;
  const a=teamById[game.teamIds[0]],b=teamById[game.teamIds[1]],inn=game.innings,venue=venueById[game.venue];
  $("#match-headline").textContent=a.flag+" "+a.name+"  vs  "+b.flag+" "+b.name;
  $("#match-status-text").textContent=game.status==="complete"?"FULL TIME":game.status==="break"?"INNINGS BREAK":"LIVE MATCH";
  const s0=inningsScore(0),s1=inningsScore(1);
  $("#score-ribbon").innerHTML='<div class="ribbon-team"><span>'+a.flag+" "+esc(a.name)+'</span><strong>'+s0.runs+"/"+s0.wickets+'</strong><small>'+formatOvers(s0.legal)+" ov"+(game.inningsIndex===0?" · 1ST":"")+'</small></div><div class="ribbon-divider">VS</div><div class="ribbon-team"><span>'+b.flag+" "+esc(b.name)+'</span><strong>'+s1.runs+"/"+s1.wickets+'</strong><small>'+formatOvers(s1.legal)+" ov"+(game.inningsIndex===1?" · 2ND":"")+'</small></div>';
  $("#scene-score").textContent=teamById[game.teamIds[inn.battingSide]].name+" "+inn.runs+"/"+inn.wickets;
  $("#scene-target").textContent=inn.target===null?game.overs+" OVERS · FIRST INNINGS":"TARGET "+inn.target+" · NEED "+Math.max(0,inn.target-inn.runs)+" FROM "+Math.max(0,game.overs*6-inn.legal)+" BALLS";
  $("#ground-name").textContent=venue.name;$("#ground-city").textContent=venue.city;$("#ground-type-label").textContent=venue.type==="beach"?"BEACH GROUND":"GREEN STADIUM";$("#scene-surface").textContent=venue.type==="beach"?"SAND PITCH · INTERNATIONAL TOUR":"GREEN OUTFIELD · INTERNATIONAL TOUR";$("#match-scene").setAttribute("aria-label",venue.type==="beach"?"Beach cricket at "+venue.name:"Cricket at "+venue.name);
  renderControls();renderScorecard();renderResumeCard();syncSwipeHint();saveLocalData();drawScene();
}
function drawBeachGround(ctx){
  if(beachArtwork.complete&&beachArtwork.naturalWidth){
    const ratio=1200/675,source=beachArtwork.naturalWidth/beachArtwork.naturalHeight;let sx=0,sy=0,sw=beachArtwork.naturalWidth,sh=beachArtwork.naturalHeight;
    if(source>ratio){sw=beachArtwork.naturalHeight*ratio;sx=(beachArtwork.naturalWidth-sw)/2;}else{sh=beachArtwork.naturalWidth/ratio;sy=(beachArtwork.naturalHeight-sh)/2;}
    ctx.drawImage(beachArtwork,sx,sy,sw,sh,0,0,1200,675);return;
  }
  const grad=ctx.createLinearGradient(0,0,0,675);grad.addColorStop(0,"#8bcfda");grad.addColorStop(.50,"#48aebb");grad.addColorStop(.51,"#ecd09a");grad.addColorStop(1,"#d2ad72");ctx.fillStyle=grad;ctx.fillRect(0,0,1200,675);
  ctx.fillStyle="rgba(255,255,255,.24)";for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(70+i*190,360+(i%2)*20,95,8,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle="#9b7548";ctx.fillRect(420,330,360,16);ctx.fillStyle="#f7e3b9";ctx.fillRect(565,280,70,135);
}
function drawPlayerFigure(ctx,x,y,scale,color,pose,motion){
  const t=performance.now()/135+(motion||0),step=Math.sin(t),reach=Math.cos(t);
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  const dive=pose==="dive",crouch=pose==="field",lean=dive?10:pose==="run"?3:pose==="swing"||pose==="follow"?4:0;
  ctx.fillStyle="rgba(13,41,39,.2)";ctx.beginPath();ctx.ellipse(0,1,dive?13:9,3,0,0,Math.PI*2);ctx.fill();
  const headX=dive?7:lean,headY=dive?-13:crouch?-25:-26;
  ctx.beginPath();ctx.arc(headX,headY,4.5,0,Math.PI*2);ctx.fillStyle="#e4b28a";ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=7;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(dive?-5:lean,-21);ctx.lineTo(dive?5:0,dive?-12:-10);ctx.stroke();
  ctx.strokeStyle=color;ctx.lineWidth=3.4;ctx.beginPath();
  if(pose==="run"){ctx.moveTo(0,-19);ctx.lineTo(-8+step*3,-14);ctx.moveTo(0,-19);ctx.lineTo(8-step*3,-25);}
  else if(pose==="bowl"){ctx.moveTo(0,-19);ctx.lineTo(-8,-12);ctx.moveTo(0,-19);ctx.lineTo(7,-30+reach*3);}
  else if(pose==="load"){ctx.moveTo(0,-19);ctx.lineTo(-10,-25);ctx.moveTo(0,-19);ctx.lineTo(8,-17);}
  else if(pose==="swing"){ctx.moveTo(0,-19);ctx.lineTo(8,-25);ctx.moveTo(0,-19);ctx.lineTo(12,-14);}
  else if(pose==="follow"){ctx.moveTo(0,-19);ctx.lineTo(12,-24);ctx.moveTo(0,-19);ctx.lineTo(11,-12);}
  else if(pose==="catch"||pose==="celebrate"){ctx.moveTo(0,-19);ctx.lineTo(-9,-31);ctx.moveTo(0,-19);ctx.lineTo(9,-31);}
  else if(dive){ctx.moveTo(0,-18);ctx.lineTo(15,-23);ctx.moveTo(0,-18);ctx.lineTo(17,-17);}
  else{ctx.moveTo(0,-19);ctx.lineTo(-7,-12);ctx.moveTo(0,-19);ctx.lineTo(7,-12);}
  ctx.stroke();
  ctx.strokeStyle="#243d3d";ctx.lineWidth=3.7;ctx.beginPath();
  if(pose==="run"){ctx.moveTo(0,-10);ctx.lineTo(-7+step*5,-4);ctx.moveTo(0,-10);ctx.lineTo(7-step*5,-2);}
  else if(dive){ctx.moveTo(4,-14);ctx.lineTo(-4,-10);ctx.moveTo(4,-14);ctx.lineTo(12,-8);}
  else{ctx.moveTo(0,-10);ctx.lineTo(-4,0);ctx.moveTo(0,-10);ctx.lineTo(4,0);}
  ctx.stroke();
  if(pose==="bat"||pose==="load"||pose==="swing"||pose==="follow"){
    ctx.strokeStyle="#f2dfb9";ctx.lineWidth=2.5;ctx.beginPath();
    const batX=pose==="swing"||pose==="follow"?11:7,batY=pose==="swing"?-15:pose==="follow"?-19:-12;
    ctx.moveTo(batX,batY);ctx.lineTo(pose==="swing"?21:pose==="follow"?19:14,pose==="swing"?-29:pose==="follow"?-31:-1);ctx.stroke();
  }
  ctx.restore();
}
function drawGreenStadium(ctx,venue,runProgress,batterPose,fieldPose){
  const sky=ctx.createLinearGradient(0,0,0,675);sky.addColorStop(0,venue.sky);sky.addColorStop(.55,"#e4eff0");sky.addColorStop(.56,"#438d65");sky.addColorStop(1,"#176542");ctx.fillStyle=sky;ctx.fillRect(0,0,1200,675);
  ctx.fillStyle=venue.sun;ctx.beginPath();ctx.arc(1020,90,38,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.55)";[[190,85,80],[380,120,56],[790,75,66]].forEach(([x,y,r])=>{ctx.beginPath();ctx.ellipse(x,y,r,13,0,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle="#d7dedc";ctx.beginPath();ctx.moveTo(18,245);ctx.lineTo(185,173);ctx.lineTo(420,236);ctx.lineTo(420,333);ctx.lineTo(20,380);ctx.closePath();ctx.fill();
  ctx.fillStyle="#c5d0ce";ctx.beginPath();ctx.moveTo(1182,245);ctx.lineTo(1015,173);ctx.lineTo(780,236);ctx.lineTo(780,333);ctx.lineTo(1180,380);ctx.closePath();ctx.fill();
  ctx.fillStyle="#536e70";ctx.fillRect(28,207,375,20);ctx.fillRect(797,207,375,20);
  for(let row=0;row<5;row++)for(let col=0;col<32;col++){
    const lx=38+col*11,rx=1162-col*11,y=242+row*18+(col>23?Math.abs(col-23)*2:0);
    ctx.fillStyle=["#cf6960","#e5c56f","#5b8292","#f2eee0","#7b9872"][(col+row*3)%5];
    ctx.fillRect(lx,y,4,4);ctx.fillRect(rx,y,4,4);
  }
  ctx.fillStyle="#f7f5e9";ctx.fillRect(26,330,382,8);ctx.fillRect(792,330,382,8);
  const field=ctx.createRadialGradient(600,440,70,600,455,620);field.addColorStop(0,"#67a75e");field.addColorStop(.7,"#418650");field.addColorStop(1,"#246c47");ctx.fillStyle=field;ctx.beginPath();ctx.ellipse(600,475,580,268,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(247,246,222,.88)";ctx.lineWidth=3;ctx.setLineDash([9,8]);ctx.beginPath();ctx.ellipse(600,475,520,230,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle="#c7d9b0";ctx.beginPath();ctx.moveTo(565,337);ctx.lineTo(635,337);ctx.lineTo(668,635);ctx.lineTo(532,635);ctx.closePath();ctx.fill();
  ctx.fillStyle="#b6c99a";ctx.beginPath();ctx.moveTo(582,364);ctx.lineTo(618,364);ctx.lineTo(636,612);ctx.lineTo(564,612);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#f9f6e6";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(578,382);ctx.lineTo(622,382);ctx.moveTo(541,597);ctx.lineTo(659,597);ctx.stroke();
  [[600,374],[600,590]].forEach(([x,y])=>{ctx.strokeStyle="#fff9e8";ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(x+i*6,y);ctx.lineTo(x+i*6,y-17);ctx.stroke();}ctx.beginPath();ctx.moveTo(x-10,y-7);ctx.lineTo(x+10,y-7);ctx.stroke();});
  [[370,438],[465,520],[735,500],[850,420],[300,518],[930,540],[485,405],[715,410]].forEach((p,i)=>drawPlayerFigure(ctx,p[0],p[1],i<4?.8:.67,i%2?"#f2f0e5":"#e9c95e",fieldPose&&i===0?fieldPose:"field",i));
  const bowlerX=535+clamp(runProgress||0,0,1)*65;drawPlayerFigure(ctx,bowlerX,425,.82,"#e9c95e",runProgress?(runProgress<.56?"run":runProgress<.77?"bowl":"follow"):"field");
  drawPlayerFigure(ctx,600,535,1.03,"#f2f0e5",batterPose||"bat");
  drawPlayerFigure(ctx,587,388,.72,"#f2f0e5",fieldPose==="catch"?"catch":"field");
  ctx.fillStyle="rgba(15,44,39,.48)";ctx.fillRect(0,0,1200,48);
  ctx.fillStyle="#f7f4e8";ctx.font="500 13px sans-serif";ctx.fillText(venue.name.toUpperCase()+" · MATCH DAY",28,30);
}
function drawScene(){
  const canvas=$("#match-scene");if(!canvas)return;
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const dpr=Math.min(window.devicePixelRatio||1,2),w=rect.width,h=rect.height;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  const ctx=canvas.getContext("2d");ctx.setTransform(canvas.width/1200,0,0,canvas.height/675,0,0);
  const game=state.game,venue=venueById[game?.venue||state.venue],running=game&&(game.phase==="bat-flight"||game.phase==="bowl-meter"),elapsed=running?performance.now()-game.startedAt:0,flightActive=game?.phase==="shot-flight"&&game.ballFlight,actionActive=running||flightActive;
  const ballProgress=flightActive?clamp((performance.now()-game.ballFlight.startedAt)/game.ballFlight.duration,0,1):0;
  const batterPose=running&&game.phase==="bat-flight"?(elapsed<game.delivery.target-180?"load":elapsed<game.delivery.target+220?"swing":"follow"):flightActive?"follow":"bat";
  const bowlerProgress=running?clamp(elapsed/game.delivery.duration,0,1):1;
  const fieldPose=flightActive?(game.ballFlight.isOut&&ballProgress>.72?"catch":ballProgress>.8?"dive":"run"):null;
  if(venue?.type==="green")drawGreenStadium(ctx,venue,running?clamp(elapsed/900,0,1):0,batterPose,fieldPose);
  else drawBeachGround(ctx);
  if(venue?.type==="beach"&&actionActive){
    const bp=running?bowlerProgress:1;
    drawPlayerFigure(ctx,540+clamp(bp/.8,0,1)*60,425,.82,"#e9c95e",bp<.56?"run":bp<.78?"bowl":"follow");
    drawPlayerFigure(ctx,600,535,1.03,"#f2f0e5",batterPose);
    drawPlayerFigure(ctx,600,384,.72,"#f2f0e5",fieldPose==="catch"?"catch":"field");
  }
  if(flightActive){
    const f=game.ballFlight,p=ballProgress,distance=f.runs===6?470:f.runs===4?390:f.runs===3?300:f.runs===2?220:f.runs===1?125:70;
    const tx=600+Math.cos(f.angle)*distance,ty=535+Math.sin(f.angle)*distance,arc=Math.sin(Math.PI*p)*(f.loft?150:50),x=600+(tx-600)*p,y=535+(ty-535)*p-arc;
    const fielderStart=tx<600?[835,425]:[365,435],fieldProgress=clamp((p-.12)*1.25,0,1);
    if(p>.12)drawPlayerFigure(ctx,fielderStart[0]+(x-fielderStart[0])*fieldProgress,fielderStart[1]+(y-fielderStart[1])*fieldProgress,.82,"#f2f0e5",fieldPose,p*4);
    drawPlayerFigure(ctx,tx<600?350:850,435,.68,"#e9c95e",p>.83?"run":"field",2);
    ctx.strokeStyle="rgba(255,248,214,.74)";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-5,y+18);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle=f.isOut?"#e87358":"#fff8e7";ctx.beginPath();ctx.arc(x,y,Math.max(3,9-p*5),0,Math.PI*2);ctx.fill();
    requestAnimationFrame(drawScene);
  }
  if(running&&game.delivery){
    const p=clamp(elapsed/game.delivery.duration,0,1),x=600+Math.sin(p*3.1)*30,y=(venue?.type==="green"?365:330)+p*185,r=10-p*3;
    ctx.strokeStyle="rgba(255,248,214,.72)";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-4,y-42);ctx.quadraticCurveTo(x-15,y-18,x,y);ctx.stroke();
    ctx.fillStyle="#fff8e7";ctx.beginPath();ctx.arc(x,y,Math.max(3,r),0,Math.PI*2);ctx.fill();requestAnimationFrame(drawScene);
  }
}
function drawMenuScene(){
  const canvas=$("#menu-scene");if(!canvas)return;
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}
  const ctx=canvas.getContext("2d");ctx.setTransform(canvas.width/1200,0,0,canvas.height/675,0,0);
  if(beachArtwork.complete&&beachArtwork.naturalWidth){
    const ratio=1200/675,source=beachArtwork.naturalWidth/beachArtwork.naturalHeight;let sx=0,sy=0,sw=beachArtwork.naturalWidth,sh=beachArtwork.naturalHeight;
    if(source>ratio){sw=beachArtwork.naturalHeight*ratio;sx=(beachArtwork.naturalWidth-sw)/2;}else{sh=beachArtwork.naturalWidth/ratio;sy=(beachArtwork.naturalHeight-sh)/2;}
    ctx.drawImage(beachArtwork,sx,sy,sw,sh,0,0,1200,675);
  }else{
    const g=ctx.createLinearGradient(0,0,0,675);g.addColorStop(0,"#8bcfda");g.addColorStop(.50,"#48aebb");g.addColorStop(.51,"#ecd09a");g.addColorStop(1,"#d2ad72");ctx.fillStyle=g;ctx.fillRect(0,0,1200,675);
    ctx.fillStyle="rgba(255,255,255,.3)";for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(70+i*140,350+(i%2)*22,80,7,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle="#c59a63";ctx.fillRect(390,330,420,24);ctx.fillStyle="#f6e2bb";ctx.fillRect(565,275,70,140);
  }
}
function renderControlSettings(){
  const modal=$("#control-settings-modal");if(!modal)return;modal.hidden=false;
  modal.querySelectorAll("[data-control-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.controlMode===state.controls.mode)));
  modal.querySelectorAll("[data-bowl-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.bowlMode===state.controls.bowlMode)));
  const timingToggle=modal.querySelector('[data-control-toggle="timingAssist"]');if(timingToggle)timingToggle.disabled=state.controls.proMode;
  modal.querySelectorAll("[data-shot-map]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.shotMap===state.controls.shotMap)));
  modal.querySelectorAll("[data-control-toggle]").forEach(b=>{const on=Boolean(state.controls[b.dataset.controlToggle]);b.setAttribute("aria-pressed",String(on));b.textContent=on?"ON":"OFF";});
  $("#swipe-sensitivity").value=String(state.controls.sensitivity);$("#sensitivity-value").textContent=state.controls.sensitivity.toFixed(1)+"×";
  $("#control-settings-note").textContent=state.controls.proMode?"Pro mode is on · timing assist is disabled.":"Control settings save on this device.";
}
function closeControlSettings(){$("#control-settings-modal").hidden=true;}
function applySwipe(dx,dy){
  const game=state.game;if(!game||game.phase!=="bat-flight"||state.controls.mode!=="swipe")return;
  if(Math.hypot(dx,dy)<34/state.controls.sensitivity)return;
  const action=state.controls.shotMap==="power"&&dy<0&&Math.abs(dy)>Math.abs(dx)*.6?"loft":Math.abs(dx)>Math.abs(dy)*1.15?(dx<0?"cut":"drive"):(dy<0?"loft":"defend");
  playShot(action,performance.now()-game.startedAt);
}
function pauseActiveDelivery(){
  const game=state.game;if(game?.status==="live"&&(game.phase==="bat-flight"||game.phase==="bowl-meter"||game.phase==="shot-flight")){game.phase="ready";game.delivery=null;game.ballFlight=null;game.event="Match paused. The next delivery is ready.";}
}
function openHome(){pauseActiveDelivery();$("#game-screen").hidden=true;$("#setup-screen").hidden=false;renderSetup();window.scrollTo({top:0,behavior:"smooth"});}
function renderApp(){
  loadLocalData();fillSelects();renderSetup();drawMenuScene();window.addEventListener("resize",()=>{drawMenuScene();drawScene();});
  $("#team-a-select").addEventListener("change",e=>setTeam(0,e.target.value));
  $("#team-b-select").addEventListener("change",e=>setTeam(1,e.target.value));
  $("#start-match").addEventListener("click",tossOpen);
  $("#squad-modal").addEventListener("click",e=>{if(e.target===$("#squad-modal"))closeSquads();});
  $("#profile-modal").addEventListener("click",e=>{if(e.target===$("#profile-modal"))closeProfile();});
  $("#auction-modal").addEventListener("click",e=>{if(e.target===$("#auction-modal"))closeAuction();});
  $("#control-settings-modal").addEventListener("click",e=>{if(e.target===$("#control-settings-modal"))closeControlSettings();});
  let origin=null;const field=$("#match-ground-card");
  field.addEventListener("pointerdown",e=>{const game=state.game,battingSwipe=state.controls.mode==="swipe"&&game?.phase==="bat-flight",bowlingSwipe=state.controls.bowlMode==="swipe"&&game?.phase==="bowl-meter";if(!battingSwipe&&!bowlingSwipe)return;origin={x:e.clientX,y:e.clientY,id:e.pointerId,kind:battingSwipe?"bat":"bowl"};try{field.setPointerCapture(e.pointerId);}catch(error){}});
  field.addEventListener("pointerup",e=>{if(!origin||origin.id!==e.pointerId)return;const gesture=origin,dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;origin=null;if(gesture.kind==="bat")applySwipe(dx,dy);else if(Math.hypot(dx,dy)>=24/state.controls.sensitivity)releaseBowl();});
  field.addEventListener("pointercancel",()=>{origin=null;});
  $("#swipe-sensitivity").addEventListener("input",e=>{state.controls.sensitivity=clamp(Number(e.target.value),.6,1.6);$("#sensitivity-value").textContent=state.controls.sensitivity.toFixed(1)+"×";saveLocalData();});
  document.addEventListener("click",e=>{
    const button=e.target.closest("button");if(!button)return;
    if(button.dataset.overs){state.overs=Number(button.dataset.overs);renderSetup();return;}
    if(button.dataset.venue){state.venue=button.dataset.venue;state.venueType=venueById[state.venue].type;renderSetup();return;}
    if(button.dataset.venueType){if(["beach","green"].includes(button.dataset.venueType)){state.venueType=button.dataset.venueType;if(!venues.some(v=>v.id===state.venue&&v.type===state.venueType))state.venue=venues.find(v=>v.type===state.venueType)?.id||state.venue;renderSetup();}return;}
    if(button.dataset.squadSide!==undefined){state.squadSide=Number(button.dataset.squadSide);state.squadPool=state.sideTeams[state.squadSide]==="LEG"?"legends":"current";renderSquads();return;}
    if(button.dataset.squadPool){state.squadPool=button.dataset.squadPool;renderSquads();return;}
    if(button.dataset.profileKey){renderProfile(button.dataset.profileKey);return;}
    if(button.dataset.playerKey){togglePlayer(button.dataset.playerKey);return;}
    if(button.dataset.tossCall){resolveTossCall(button.dataset.tossCall);return;}
    if(button.dataset.tossChoice){chooseTossDecision(button.dataset.tossChoice);return;}
    if(button.dataset.controlMode){state.controls.mode=button.dataset.controlMode;renderMatch();renderControlSettings();saveLocalData();return;}
    if(button.dataset.bowlMode){state.controls.bowlMode=button.dataset.bowlMode;renderControlSettings();saveLocalData();return;}
    if(button.dataset.shotMap){state.controls.shotMap=button.dataset.shotMap;renderMatch();renderControlSettings();saveLocalData();return;}
    if(button.dataset.controlToggle){const key=button.dataset.controlToggle;if(key==="timingAssist"&&state.controls.proMode)return;state.controls[key]=!state.controls[key];if(key==="proMode"&&state.controls.proMode)state.controls.timingAssist=false;renderMatch();renderControlSettings();saveLocalData();return;}
    if(button.dataset.bowlType){state.game.bowlType=button.dataset.bowlType;renderMatch();return;}
    if(button.dataset.bowlLength){state.game.bowlLength=button.dataset.bowlLength;renderMatch();return;}
    if(button.dataset.shot){if(state.controls.mode==="tap")playShot(button.dataset.shot,performance.now()-(state.game?.startedAt||performance.now()));else showToast("Swipe in the match view, or switch to Tap controls.");return;}
    switch(button.dataset.command){
      case "squads":openSquads(Number(button.dataset.side||0));break;
      case "close-squads":closeSquads();break;
      case "open-auction":openAuction();break;
      case "close-auction":closeAuction();break;
      case "start-auction":startAuction($("#auction-club-select").value);break;
      case "new-auction":startAuction($("#auction-club-select").value);break;
      case "auction-bid":auctionBid();break;
      case "auction-hammer":auctionHammer();break;
      case "use-auction-xi":if(auctionRoster().length>=11){state.sideTeams[0]="AUCTION";state.sideLineups[0]=auctionRoster().slice(0,11).map(p=>({...p}));fillSelects();closeAuction();showToast("Your auction XI is ready for the next match.");}else showToast("Sign at least 11 players first.");break;
      case "close-profile":closeProfile();break;
      case "save-squads":if(state.sideLineups[state.squadSide].length===11)closeSquads();else showToast("Select exactly 11 players before saving.");break;
      case "home":openHome();break;
      case "resume":if(state.game){$("#setup-screen").hidden=true;$("#game-screen").hidden=false;renderMatch();}break;
      case "launch":case "next-ball":startDelivery();break;
      case "release-bowl":if(state.controls.bowlMode==="tap")releaseBowl();else showToast("Flick the pitch to release, or switch Bowling release to Tap.");break;
      case "start-chase":startChase();break;
      case "rematch":openHome();tossOpen();break;
      case "open-control-settings":renderControlSettings();break;
      case "close-control-settings":closeControlSettings();break;
      case "cancel-toss":state.toss=null;renderToss();renderSetup();break;
      case "start-after-toss":if(state.toss?.phase==="result")beginMatch();break;
    }
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){if(!$("#squad-modal").hidden)closeSquads();if(!$("#profile-modal").hidden)closeProfile();if(!$("#auction-modal").hidden)closeAuction();if(!$("#control-settings-modal").hidden)closeControlSettings();if(!$("#toss-modal").hidden){state.toss=null;renderToss();renderSetup();}return;}
    if(!state.game||!$("#squad-modal").hidden||!$("#profile-modal").hidden||!$("#auction-modal").hidden||!$("#control-settings-modal").hidden||!$("#toss-modal").hidden)return;
    if(e.code==="Space"){e.preventDefault();if(state.game.phase==="bowl-meter")releaseBowl();else if(state.game.phase==="ready"||state.game.phase==="result")startDelivery();return;}
    const shots={"1":"drive","2":"loft","3":"cut","4":"defend"};if(shots[e.key]&&state.game.phase==="bat-flight")playShot(shots[e.key],performance.now()-state.game.startedAt);
  });
  document.addEventListener("visibilitychange",()=>{if(document.hidden){pauseActiveDelivery();saveLocalData();}});
  window.addEventListener("beforeunload",()=>{pauseActiveDelivery();saveLocalData();});
  if(state.game&&state.game.status!=="complete"){$("#setup-screen").hidden=true;$("#game-screen").hidden=false;renderMatch();}
  else if(state.toss)renderToss();
}
function weightedRun(choices){const r=Math.random();let sum=0;for(const [value,weight] of choices){sum+=weight;if(r<=sum)return value;}return choices[choices.length-1][0];}
renderApp();
