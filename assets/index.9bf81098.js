import{_ as e,d as t,a as o,s as n,b as a,c as l,e as s,f as r,g as i,h as u,i as d,j as m,k as p,l as h,m as c,r as f,n as g,o as _,p as w,w as y,t as v,q as b,u as O,v as E,x as D,y as T,z as A,A as L,B as M,P as N}from"./vendor.fc51f8d5.js";function S(t){const o=e.uniqBy(t,"opponent.id").length,n=e.groupBy(t,(e=>e.opponent.id));return{uniqueCount:o,neverWonCount:Object.keys(n).filter((e=>0==n[e].filter((e=>e.won)).length)).length,neverLostCount:Object.keys(n).filter((e=>0==n[e].filter((e=>!e.won)).length)).length,playedOnceCount:Object.keys(n).filter((e=>1==n[e].length)).length,playedMoreCount:Object.keys(n).filter((e=>n[e].length>=5)).length}}function x(t){return z(e.mean(t.filter((e=>e["elo-change"]>0)).map((e=>e.won?e["elo-change"]:-1*e["elo-change"]))),!1)}function k(t){return z(e.mean(t.filter((e=>e.won&&e["elo-change"]>0)).map((e=>e["elo-change"]))),!1)}function W(t){return z(e.mean(t.filter((e=>!e.won&&e["elo-change"]>0)).map((e=>-1*e["elo-change"]))),!1)}function R(t){return e.sum(t.map((e=>e.won?e["elo-change"]:-1*e["elo-change"])))}function G(t){return e.sum(t.filter((e=>e.won)).map((e=>e["elo-change"])))}function V(t){return e.sum(t.filter((e=>!e.won)).map((e=>-1*e["elo-change"])))}function C(t){return Math.round(e.mean(t.map((e=>e["elo-diff"]))))}function I(t){return Math.round(e.mean(e.uniqBy(t,"opponent.id").map((e=>e["elo-diff-now"]))))}function P(t){const o=e.maxBy(t,"opponent.match-elo"),n=e.findLast(t,(e=>e.opponent.id==(null==o?void 0:o.opponent.id)));return{last:o,first:n}}function B(t){const o=e.maxBy(t,"opponent.current-elo"),n=e.findLast(t,(e=>e.opponent.id==(null==o?void 0:o.opponent.id)));return{last:o,first:n}}function Y(t){return e.minBy(t,"opponent.match-elo")}function H(t){return e.minBy(t,"opponent.current-elo")}function U(t){const o=e.maxBy(t,"opponent.elo-gain"),n=t.find((e=>e.id!=o.id&&e.opponent.id===o.opponent.id));return{firstGame:o,lastGame:n}}function F(t){return e.minBy(t.filter((e=>e.opponent["elo-gain"]<=0&&e.opponent["current-elo"]>0&&1500!=e.opponent["current-elo"])),"opponent.elo-gain")}function q(t){const o=e.reduce(t,((e,t)=>{const o=t.offsetDate.format("YYYY-MM-DD");return o in e||(e[o]=0),e[o]++,e}),{}),n=e.maxBy(Object.keys(o),(e=>o[e])),a=t.filter((e=>e.offsetDate.format("YYYY-MM-DD")==n)),l=e.sumBy(a,(e=>e.won?e["elo-change"]:-1*e["elo-change"])),s=e.sumBy(a,"won"),r=a[a.length-1].self["match-elo"],i=a[0].self["match-elo"]+(a[0].won?a[0]["elo-change"]:-1*a[0]["elo-change"]);return{average:z(e.mean(Object.values(o)),!1),max:o[n],maxDate:new Date(n),maxDateElo:l,maxDateWins:s,maxDateStart:r,maxDateEnd:i}}function j(t){const o=e.reduce(t,((e,t)=>(t.opponent.userName in e||(e[t.opponent.userName]=0),e[t.opponent.userName]+=t.won?t["elo-change"]:-1*t["elo-change"],e)),{}),n=e.maxBy(Object.keys(o),(e=>o[e])),a=o[n],l=e.find(t,(e=>e.opponent.userName==n)).opponent.id,s=e.minBy(Object.keys(o),(e=>o[e])),r=o[s],i=e.find(t,(e=>e.opponent.userName==s)).opponent.id;return{maxName:n,maxId:l,maxGain:a,minName:s,minId:i,minGain:r}}function $(t){const o=e.groupBy(t,(e=>e.opponent.userName)),n=e.maxBy(Object.keys(o),(e=>o[e].length)),a=o[n],l=e.maxBy(Object.keys(o),(e=>o[e].filter((e=>e.won)).length)),s=o[l],r=e.maxBy(Object.keys(o),(e=>o[e].filter((e=>!e.won)).length)),i=o[r];return{mostPlayed:n,mostPlayedGames:a.length,mostPlayedWon:a.filter((e=>e.won)).length,mostPlayedData:a,mostPlayedEloChange:e.sumBy(a,(e=>(e.won?1:-1)*e["elo-change"])),mostWon:l,mostWonGames:s.length,mostWonWon:s.filter((e=>e.won)).length,mostWonData:s,mostWonEloChange:e.sumBy(s,(e=>(e.won?1:-1)*e["elo-change"])),mostLost:r,mostLostGames:i.length,mostLostLost:i.filter((e=>!e.won)).length,mostLostData:i,mostLostEloChange:e.sumBy(i,(e=>(e.won?1:-1)*e["elo-change"]))}}function Q(t){const o=e.sumBy(t,(e=>e.rounds.length)),n=t.flatMap((e=>e.rounds)).filter((e=>11==e["self-score"]||11==e["opponent-score"]||2==Math.abs(e["self-score"]-e["opponent-score"]))),a=n.filter((e=>e["self-score"]>=12||e["opponent-score"]>=12)),l=t.filter((e=>e.rounds.length>1&&e.rounds[0].won)),s=t.filter((e=>e.rounds.length>1&&!e.rounds[0].won)),r=t.filter((e=>e.rounds.length>2)),i=t.filter((e=>e.rounds.length<=2));return{matchesTo3:z(r.length/t.length,!0),matchesTo3Won:z(r.filter((e=>e.won)).length/r.length,!0),roundsToOvertime:z(a.length/o,!0),roundsToOvertimeWon:z(a.filter((e=>e.won)).length/a.length,!0),matchesTo2Won:z(i.filter((e=>e.won)).length/i.length,!0),hardWonRounds:n.filter((e=>0==e["opponent-score"])).length,hardWonRoundsPercentage:z(n.filter((e=>0==e["opponent-score"])).length/n.length,!0),hardLostRounds:n.filter((e=>0==e["self-score"])).length,hardLostRoundsPercentage:z(n.filter((e=>0==e["self-score"])).length/n.length,!0),longestRoundWon:e.maxBy(n.filter((e=>e.won)),(e=>e["self-score"]+e["opponent-score"])),longestRoundLost:e.maxBy(n.filter((e=>!e.won)),(e=>e["self-score"]+e["opponent-score"])),matchesFirstRoundWon:z(l.filter((e=>e.won&&2==e.rounds.length)).length/l.length,!0),matchesFirstRoundLost:z(s.filter((e=>e.won)).length/s.length,!0)}}function z(e,t){return t?(Math.round(1e3*e)/10).toFixed(1):(Math.round(10*e)/10).toFixed(1)}var J,K,X,Z,ee,te,oe=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",WINS:function(e){return e.filter((e=>e.won)).length},WINRATE:function(e){return z(e.filter((e=>e.won)).length/e.length,!0)},UNIQUE_OPPONENTS:S,AVERAGE_CHANGE:x,AVERAGE_GAIN:k,AVERAGE_LOSS:W,TOTAL_CHANGE:R,TOTAL_GAIN:G,TOTAL_LOSS:V,AVERAGE_ELO_MATCH:function(t){return Math.round(e.mean(t.map((e=>e.opponent["match-elo"]))))},AVERAGE_ELO_DIFF_MATCH:C,AVERAGE_OPPONENT_WINRATE:function(t){return z(e.meanBy(t.filter((e=>e.opponent.wins+e.opponent.losses>0)),(e=>e.opponent.wins/(e.opponent.wins+e.opponent.losses))),!0)},AVERAGE_OPPONENT_WINRATE_UNIQUE:function(t){return z(e.meanBy(e.uniqBy(t.filter((e=>e.opponent.wins+e.opponent.losses>0)),"opponent.id"),(e=>e.opponent.wins/(e.opponent.wins+e.opponent.losses))),!0)},AVERAGE_ELO_NOW:function(t){return Math.round(e.mean(t.map((e=>e.opponent["current-elo"]))))},AVERAGE_ELO_DIFF_UNIQUE:I,AVERAGE_ELO_UNIQUE:function(t){return Math.round(e.mean(e.uniqBy(t,"opponent.id").map((e=>e.opponent["current-elo"]))))},HIGHEST_MATCH:P,HIGHEST_NOW:B,LOWEST_MATCH:Y,LOWEST_NOW:H,MOST_IMPROVED:U,LEAST_IMPROVED:F,MATCHES_DAY:q,MOST_ELO_GAINED_LOST:j,MOST_PLAYED:$,ALL_ROUND_STATS:Q});function ne(e,t,o){let n=t.attributes["home-team"][0],a=t.attributes["home-elo"];return e!=o&&(n=t.attributes["away-team"][0],a=t.attributes["away-elo"]),{id:n.id,userName:n.UserName,"current-elo":n.ELO,"match-elo":a,"elo-gain":n.ELO-a,"elo-gain-formatted":ae(n.ELO-a),rank:n.Rank,wins:n.Wins,losses:n.Losses,lastOnline:n.LastOnline}}function ae(e){return 0==e?"=":e>0?`+${Math.round(e)}`:Math.round(e).toString()}(K=J||(J={})).All="all",K.Ranked="ranked",K.Unranked="unranked",(Z=X||(X={})).All="all",Z.Home="home",Z.Away="away",(te=ee||(ee={})).All="all",te.Higher="higher",te.Lower="lower";var le=o({name:"ElevenStats",components:{Calendar:n,InputText:a,Button:l,Dropdown:s,ProgressSpinner:r,Card:i,DataTable:u,Column:d,TabView:m,TabPanel:p,InputNumber:h,Avatar:c},setup(){const e=f(!0),o=f(""),n=f(""),a=f(""),l=f(J.All),s=f([{name:"All",val:J.All},{name:"Ranked",val:J.Ranked},{name:"Unranked",val:J.Unranked}]),r=f(X.All),i=f([{name:"All",val:X.All},{name:"Home",val:X.Home},{name:"Away",val:X.Away}]),u=f(ee.All),d=f([{name:"All",val:ee.All},{name:"Higher Opponent ELO",val:ee.Higher},{name:"Lower Opponent ELO",val:ee.Lower}]),m=g((()=>{var e=`<i>${l.value}</i> ${h.value.length} matches `;return l.value!==J.All&&(e=`${h.value.length} <i>${l.value}</i> matches `),r.value!==X.All&&(r.value===X.Home?e+="that you <i>challenged</i> ":e+="that you <i>accepted</i> "),u.value!==ee.All&&(u.value===ee.Higher?e+="against <i>higher</i> ranked opponents ":e+="against <i>lower</i> ranked opponents "),_.value.getTime()==y.value.getTime()&&w.value.getTime()!=v.value.getTime()?e+=`<i>before</i> ${w.value.toDateString()}`:w.value.getTime()==v.value.getTime()&&_.value.getTime()!=y.value.getTime()?e+=`<i>after</i> ${_.value.toDateString()}`:_.value.getTime()!=y.value.getTime()&&w.value.getTime()!=v.value.getTime()&&(e+=`<i>between</i> ${_.value.toDateString()} and ${w.value.toDateString()}`),e})),p=f(new Array),h=g((()=>function(e,o,n,a,l,s,r){const i=t(l).startOf("day").add(r,"hours"),u=t(s).endOf("day").add(r,"hours");return e.filter((e=>{if(!e.complete)return!1;if(!e.ranked&&e["elo-change"]>0)return!1;if(o!==J.All&&e.ranked!==(o===J.Ranked))return!1;if(n!==X.All&&e.home!==(n===X.Home))return!1;if(a!==ee.All){if(a===ee.Higher&&e.opponent["match-elo"]<e.self["match-elo"])return!1;if(a===ee.Lower&&e.opponent["match-elo"]>=e.self["match-elo"])return!1}return!e.offsetDate.isBefore(i)&&!e.offsetDate.isAfter(u)}))}(p.value,l.value,r.value,u.value,_.value,w.value,O.value))),c=g((()=>h.value.length)),_=f(new Date),w=f(new Date),y=g((()=>p.value.length>0?p.value[p.value.length-1].offsetDate.startOf("day").toDate():new Date)),v=g((()=>p.value.length>0?p.value[0].offsetDate.startOf("day").toDate():new Date)),b=f(0),O=f(0),E=f({type:"pie",data:{labels:["Hitting the bed","Couldn't return serve","Dog distracted you","Arrow to the knee"],datasets:[{backgroundColor:["#41B883","#E46651","#00D8FF","#DD1B16"],data:[30,20,25,15]}]}});return{loaded:e,id:o,name:n,message:a,ranked:l,home:r,higher:u,details:m,rankedOptions:s,homeOptions:i,higherOptions:d,matches:p,filteredMatches:h,matchNumber:c,startDate:_,endDate:w,earliestDate:y,latestDate:v,utcOffset:b,dayCutoff:O,STATS:oe,chartData:E}},computed:{formatDetailsHTML(){return`You selected ${this.details}`},matchCounts(){return q(this.filteredMatches)},gains(){return[{type:"Gain",average:k(this.filteredMatches),total:G(this.filteredMatches)},{type:"Loss",average:W(this.filteredMatches),total:V(this.filteredMatches)},{type:"Net",average:x(this.filteredMatches),total:R(this.filteredMatches)}]},average_elo_diff(){return C(this.filteredMatches)},average_elo_diff_unique(){return I(this.filteredMatches)},highest_match_last(){return P(this.filteredMatches).last},highest_match_first(){return P(this.filteredMatches).first},highest_now_last(){return B(this.filteredMatches).last},highest_now_first(){return B(this.filteredMatches).first},lowest_match(){return Y(this.filteredMatches)},lowest_now(){return H(this.filteredMatches)},most_improved(){return U(this.filteredMatches)},least_improved(){return F(this.filteredMatches)},most_gained_lost(){return j(this.filteredMatches)},most_played(){return $(this.filteredMatches)},all_round_stats(){return Q(this.filteredMatches)},unique_opponents(){return S(this.filteredMatches)}},watch:{utcOffset(){this.matches=this.matches.map((e=>(e.offsetDate=e.date.add(this.utcOffset,"hours"),e)))},latestDate(){this.startDate=new Date(this.earliestDate.getTime()),this.endDate=new Date(this.latestDate.getTime())}},methods:{resetName(){this.name=""},resetID(){this.id=""},formatScore(e){let t="";for(const o of e.rounds)t+=`${o["score-formatted"]} `;return t},getJSON:async e=>(await fetch(e)).json(),async validateID(){if(this.name||this.id){if(this.id){const e=await fetch(`https://www.elevenvr.club/accounts/${this.id}`);return 404===e.status?(this.message="No matching ID found!",!1):(this.name=(await e.json()).data.attributes["user-name"],this.id)}{const e=await this.getJSON(`https://www.elevenvr.club/accounts/search/${encodeURIComponent(this.name)}`);for(const t of e.data)if(t.attributes["user-name"]===this.name)return t.id;return this.message="No matching name found!",!1}}return!1},resetValues(){this.matches=[],this.loaded=!1,this.ranked=J.All,this.home=X.All,this.higher=ee.All,this.utcOffset=0,this.dayCutoff=0},async collectStats(){this.resetValues();const e=await this.validateID();if(!e)return void(this.loaded=!0);this.id=e;const o=[],n=[];for(var a=`https://www.elevenvr.club/accounts/${this.id}/matches`;a;){const e=await this.getJSON(a);o.push(...e.data),n.push(...e.included),a=e.links.next}this.matches=function(e,o,n){const a=new Array,l=Object.fromEntries(n.map((e=>[e.id,e])));for(const[s,r]of o.entries()){const o=r.attributes["home-team"][0].id==parseInt(e),n={id:r.id,ranked:r.attributes.ranked,home:o,won:r.attributes.winner!=Number(o),complete:1==r.attributes.state&&r.attributes.winner>-1,self:ne(o,r,!0),opponent:ne(o,r,!1),"elo-diff":0,"elo-diff-formatted":"","elo-diff-now":0,"elo-diff-now-formatted":"","elo-change":r.attributes["elo-change"],date:t(r.attributes["created-at"]),offsetDate:t(r.attributes["created-at"]),rounds:[]};n["elo-diff"]=n.self["match-elo"]-n.opponent["match-elo"],n["elo-diff-formatted"]=ae(n["elo-diff"]),n["elo-diff-now"]=n.self["current-elo"]-n.opponent["current-elo"],n["elo-diff-now-formatted"]=ae(n["elo-diff-now"]);for(const e of r.relationships.rounds.data){const t=l[e.id],a={id:t.id,"opponent-id":n.opponent.id,"opponent-username":n.opponent.userName,"self-score":o?t.attributes["home-score"]:t.attributes["away-score"],"opponent-score":o?t.attributes["away-score"]:t.attributes["home-score"],"score-formatted":"",won:!1,complete:t.attributes["home-score"]>=11||t.attributes["away-score"]>=11};a["score-formatted"]=`${a["self-score"]}-${a["opponent-score"]}`,a.won=a["self-score"]>a["opponent-score"],n.rounds.push(a)}n.rounds.sort(((e,t)=>parseInt(e.id)-parseInt(t.id))),a.push(n)}return a}(e,o,n),this.message="",this.loaded=!0,this.startDate=this.earliestDate,this.endDate=this.latestDate}}});const se=O();E("data-v-c32a7182");const re=w("label",{class:"p-m-2",for:"id"},"Enter Eleven ID (exact) ",-1),ie=w("label",{class:"p-m-2",for:"id"}," or Eleven Name (exact) ",-1),ue=w("label",{for:"offset"},"UTC Offset:",-1),de=w("label",{for:"cutoff"},"Day cutoff:",-1),me={key:0},pe={key:2},he={key:3},ce=w("label",{for:"ranked"},"Match type: ",-1),fe=w("label",{for:"home"}," Match Location: ",-1),ge=w("label",{for:"higher"}," Opponent ELO: ",-1),_e=w("label",{for:"startDate"}," Start date:",-1),we=w("label",{for:"endDate"}," End date:",-1),ye={class:"p-grid"},ve={class:"cardbox p-col-12 p-md-6 p-lg-3"},be=L("Matches"),Oe=L(" You "),Ee=w("b",null,"won",-1),De=w("b",null,"winrate",-1),Te=w("b",null,"unique",-1),Ae=L(" opponents. "),Le=w("b",null,"only",-1),Me=L(" days you played. "),Ne={class:"cardbox p-col-12 p-md-6 p-lg-3"},Se=L("Marathon day"),xe=L(" The "),ke=w("b",null,"most",-1),We=L(" matches. "),Re=L(" Of those, you "),Ge=w("b",null,"won",-1),Ve={key:0,class:"cardbox p-col-12 p-md-6 p-lg-3"},Ce=L(" ELO gains (Not accurate) "),Ie={class:"cardbox p-col-12 p-md-6 p-lg-3"},Pe=L(" Average opponent "),Be=L(" At match time, your "),Ye=w("b",null,"average",-1),He=L(" yourself. "),Ue={class:"cardbox p-col-12 p-md-6 p-lg-3"},Fe=L(" Rematch time? "),qe=L(" If you were to play each opponent "),je=w("b",null,"once",-1),$e=L(" again, their "),Qe=w("b",null,"average",-1),ze=w("b",null,"never lost",-1),Je=w("b",null,"never won",-1),Ke=w("b",null,"only once",-1),Xe=w("b",null,"at least 5",-1),Ze=L(" times. "),et={class:"cardbox p-col-12 p-md-6 p-lg-3"},tt=L("Final boss? "),ot=L(" The "),nt=w("b",null,"highest",-1),at=L(" You "),lt={key:0},st={class:"cardbox p-col-12 p-md-6 p-lg-3"},rt=L("Hidden Boss"),it=L(" The "),ut=w("b",null,"highest",-1),dt=L(" ELO opponent "),mt=w("b",null,"now",-1),pt=L(" You "),ht={key:0},ct={class:"cardbox p-col-12 p-md-6 p-lg-3"},ft=L("Go easy on them"),gt=L(" The "),_t=w("b",null,"lowest",-1),wt=L(" You "),yt={class:"cardbox p-col-12 p-md-6 p-lg-3"},vt=L("Can it get worse?"),bt=L(" The "),Ot=w("b",null,"lowest",-1),Et=L(" ELO opponent "),Dt=w("b",null,"now",-1),Tt=w("b",null,"first",-1),At=L(" played "),Lt=L(" You "),Mt={class:"cardbox p-col-12 p-md-6 p-lg-3"},Nt=L("Old friends and enemies"),St={key:0},xt=w("b",null,"Most",-1),kt=L(" Most "),Wt=w("b",null,"wins",-1),Rt=L(" Most "),Gt=w("b",null,"losses",-1),Vt={key:1},Ct=w("b",null,"Most",-1),It=L(" Most "),Pt=w("b",null,"wins",-1),Bt=L(" Most "),Yt=w("b",null,"losses",-1),Ht={class:"cardbox p-col-12 p-md-6 p-lg-3"},Ut=L("Rising talent"),Ft=L(" The opponent who "),qt=w("b",null,"most improved",-1),jt=L(" since you "),$t=w("b",null,"first",-1),Qt=w("b",null,"first",-1),zt=L(" played "),Jt=L(" They have since "),Kt=w("b",null,"risen",-1),Xt={key:0},Zt={class:"cardbox p-col-12 p-md-6 p-lg-3"},eo=L("Fallen from grace"),to=L(" The opponent who "),oo=w("b",null,"declined most",-1),no=L(" since you "),ao=w("b",null,"first",-1),lo=w("b",null,"first",-1),so=L(" played "),ro=L(" They have since "),io=w("b",null,"fallen",-1),uo={key:1,class:"cardbox p-col-12 p-md-6 p-lg-3"},mo=L("Grand Theft ELO"),po={class:"cardbox p-col-12 p-md-6 p-lg-3"},ho=L("Last chance"),co=w("b",null,"round 3",-1),fo=w("b",null,"beyond",-1),go={class:"cardbox p-col-12 p-md-6 p-lg-3"},_o=L("Fast win..or fast loss?"),wo={class:"cardbox p-col-12 p-md-6 p-lg-3"},yo=L("First impressions"),vo=L(" In matches where you "),bo=w("b",null,"win",-1),Oo=L(" the "),Eo=w("b",null,"first",-1),Do=L(" In matches where you "),To=w("b",null,"lose",-1),Ao=L(" the "),Lo=w("b",null,"first",-1),Mo={class:"cardbox p-col-12 p-md-6 p-lg-3"},No=L("Ping-Pong"),So={class:"p-grid"},xo={class:"cardbox p-col-12 p-md-6 p-lg-4"},ko=L("Totally Real reasons you're losing"),Wo=L(" Work in Progress! ");D();const Ro=se(((e,t,o,n,a,l)=>{const s=T("InputText"),r=T("Button"),i=T("InputNumber"),u=T("ProgressSpinner"),d=T("Dropdown"),m=T("Calendar"),p=T("Card"),h=T("Column"),c=T("DataTable"),f=T("Avatar"),g=T("TabPanel"),O=T("TabView");return A(),_("div",null,[w("form",{onSubmit:t[5]||(t[5]=y(((...t)=>e.collectStats&&e.collectStats(...t)),["prevent"]))},[re,w(s,{type:"text",class:"p-m-2",onFocus:e.resetName,modelValue:e.id,"onUpdate:modelValue":t[1]||(t[1]=t=>e.id=t),name:"id"},null,8,["onFocus","modelValue"]),ie,w(s,{type:"text",class:"p-m-2",onFocus:e.resetID,modelValue:e.name,"onUpdate:modelValue":t[2]||(t[2]=t=>e.name=t),name:"name"},null,8,["onFocus","modelValue"]),w(r,{class:"p-m-2",label:"submit",type:"submit"}),ue,w(i,{id:"offset",inputStyle:"width: 4rem",showButtons:"",modelValue:e.utcOffset,"onUpdate:modelValue":t[3]||(t[3]=t=>e.utcOffset=t),suffix:":00",max:12,min:-12},null,8,["modelValue"]),de,w(i,{id:"cutoff",inputStyle:"width: 5rem",showButtons:"",modelValue:e.dayCutoff,"onUpdate:modelValue":t[4]||(t[4]=t=>e.dayCutoff=t),suffix:":00 am",max:7,min:0},null,8,["modelValue"])],32),e.message?(A(),_("div",me,v(e.message),1)):b("",!0),e.loaded?b("",!0):(A(),_(u,{key:1})),e.loaded&&e.matches.length>0&&0==e.filteredMatches.length?(A(),_("div",pe," Your selection does not match any matches! ")):b("",!0),e.matches.length>0?(A(),_("div",he,[ce,w(d,{name:"ranked",modelValue:e.ranked,"onUpdate:modelValue":t[6]||(t[6]=t=>e.ranked=t),options:e.rankedOptions,optionLabel:"name",optionValue:"val"},null,8,["modelValue","options"]),fe,w(d,{name:"home",modelValue:e.home,"onUpdate:modelValue":t[7]||(t[7]=t=>e.home=t),options:e.homeOptions,optionLabel:"name",optionValue:"val"},null,8,["modelValue","options"]),ge,w(d,{name:"higher",modelValue:e.higher,"onUpdate:modelValue":t[8]||(t[8]=t=>e.higher=t),options:e.higherOptions,optionLabel:"name",optionValue:"val"},null,8,["modelValue","options"]),_e,w(m,{name:"startDate",modelValue:e.startDate,"onUpdate:modelValue":t[9]||(t[9]=t=>e.startDate=t),selectOtherMonths:"",dateFormat:"yy-mm-dd",minDate:e.earliestDate,maxDate:e.endDate},null,8,["modelValue","minDate","maxDate"]),we,w(m,{name:"endDate",modelValue:e.endDate,"onUpdate:modelValue":t[10]||(t[10]=t=>e.endDate=t),selectOtherMonths:"",dateFormat:"yy-mm-dd",minDate:e.startDate,maxDate:e.latestDate},null,8,["modelValue","minDate","maxDate"]),w("h2",{innerHTML:e.formatDetailsHTML},null,8,["innerHTML"]),w(O,null,{default:se((()=>[w(g,{header:"Statistics"},{default:se((()=>[w("div",ye,[w("div",ve,[w(p,{class:"p-p-4"},{title:se((()=>[be])),content:se((()=>[w("p",null,[Oe,Ee,L(" "+v(e.STATS.WINS(e.filteredMatches))+" out of "+v(e.matchNumber)+" matches, a ",1),De,L(" of "+v(e.STATS.WINRATE(e.filteredMatches))+"% ",1)]),w("p",null,[L(" In that time, you played "+v(e.unique_opponents.uniqueCount)+" ",1),Te,Ae]),w("p",null,[L(" You played an average of "+v(e.matchCounts.average)+" matches per day, counting ",1),Le,Me])])),_:1})]),w("div",Ne,[w(p,{class:"p-p-4"},{title:se((()=>[Se])),content:se((()=>[w("p",null,[xe,ke,L(" matches you played was on "+v(e.matchCounts.maxDate.toDateString())+", with an impressive ",1),w("b",null,v(e.matchCounts.max),1),We]),w("p",null,[Re,Ge,L(" "+v(e.matchCounts.maxDateWins)+", with a net ELO change of "+v(e.matchCounts.maxDateElo)+". ",1)]),w("p",null," You started the day with "+v(e.matchCounts.maxDateStart)+" ELO and ended with "+v(e.matchCounts.maxDateEnd)+" ELO ",1)])),_:1})]),"unranked"!==e.ranked?(A(),_("div",Ve,[w(p,{class:"p-p-4"},{title:se((()=>[Ce])),content:se((()=>[w(c,{value:e.gains},{default:se((()=>[w(h,{field:"type",header:""}),w(h,{field:"average",header:"Average"}),w(h,{field:"total",header:"Total"})])),_:1},8,["value"])])),_:1})])):b("",!0),w("div",Ie,[w(p,{class:"p-p-4"},{title:se((()=>[Pe])),content:se((()=>[w("p",null,[Be,Ye,L(" opponent ELO was "+v(e.STATS.AVERAGE_ELO_MATCH(e.filteredMatches)),1)]),w("p",null,[L(" On average, you played opponents "+v(Math.abs(e.average_elo_diff))+" ELO ",1),w("b",null,v(e.average_elo_diff>0?"below":"above"),1),He]),w("p",null," On average, your opponents have a winrate of "+v(e.STATS.AVERAGE_OPPONENT_WINRATE(e.filteredMatches))+"% ("+v(e.STATS.AVERAGE_OPPONENT_WINRATE_UNIQUE(e.filteredMatches))+"% unique) ",1)])),_:1})]),w("div",Ue,[w(p,{class:"p-p-4"},{title:se((()=>[Fe])),content:se((()=>[w("p",null,[qe,je,$e,Qe,L(" ELO would be "+v(e.STATS.AVERAGE_ELO_UNIQUE(e.filteredMatches))+", putting you "+v(e.average_elo_diff_unique)+" ELO "+v(e.average_elo_diff_unique>0?"above":"below")+" them. ",1)]),w("p",null,[L(" Of those "+v(e.unique_opponents.uniqueCount)+", you have ",1),ze,L(" to "+v(e.unique_opponents.neverLostCount)+" and ",1),Je,L(" to "+v(e.unique_opponents.neverWonCount)+" of them. ",1)]),w("p",null,[L(" You have played "+v(e.unique_opponents.playedOnceCount)+" ",1),Ke,L(", and "+v(e.unique_opponents.playedMoreCount)+" ",1),Xe,Ze])])),_:1})]),w("div",et,[w(p,{class:"p-p-4"},{title:se((()=>[tt,w(f,{style:{"vertical-align":"middle"},size:"xlarge",image:"src/assets/cat.png"})])),content:se((()=>[w("p",null,[ot,nt,L(" ELO opponent you played was "+v(e.highest_match_last.opponent.userName)+" ("+v(e.highest_match_last.opponent.id)+") at "+v(e.highest_match_last.opponent["match-elo"])+". ",1)]),w("p",null," You were "+v(e.highest_match_last.self["match-elo"])+" ("+v(e.highest_match_last["elo-diff-formatted"])+") and they are now "+v(e.highest_match_last.opponent["current-elo"]),1),w("p",null,[at,w("b",null,v(e.highest_match_last.won?"won":"lost"),1),L(" with a score of "+v(e.formatScore(e.highest_match_last)),1)]),e.highest_match_first.id!=e.highest_match_last.id?(A(),_("p",lt,[L(" Your first match against "+v(e.highest_match_first.opponent.userName)+" was at "+v(e.highest_match_first.self["match-elo"])+"-"+v(e.highest_match_first.opponent["match-elo"])+". You ",1),w("b",null,v(e.highest_match_first.won?"won":"lost"),1),L(" with a score of "+v(e.formatScore(e.highest_match_first)),1)])):b("",!0)])),_:1})]),w("div",st,[w(p,{class:"p-p-4"},{title:se((()=>[rt])),content:se((()=>[w("p",null,[it,ut,dt,mt,L(" would be "+v(e.highest_now_last.opponent.userName)+" ("+v(e.highest_now_last.opponent.id)+") at "+v(e.highest_now_last.opponent["current-elo"])+". ",1)]),w("p",null," You were "+v(e.highest_now_last.self["match-elo"])+" ("+v(e.highest_now_last["elo-diff-formatted"])+") and they were "+v(e.highest_now_last.opponent["match-elo"])+" when you last played them. ",1),w("p",null,[pt,w("b",null,v(e.highest_now_last.won?"won":"lost"),1),L(" with a score of "+v(e.formatScore(e.highest_now_last)),1)]),e.highest_now_first.id!=e.highest_now_last.id?(A(),_("p",ht,[L(" Your first match against "+v(e.highest_now_first.opponent.userName)+" was at "+v(e.highest_now_first.self["match-elo"])+"-"+v(e.highest_now_first.opponent["match-elo"])+". You ",1),w("b",null,v(e.highest_now_first.won?"won":"lost"),1),L(" with a score of "+v(e.formatScore(e.highest_now_first)),1)])):b("",!0)])),_:1})]),w("div",ct,[w(p,{class:"p-p-4"},{title:se((()=>[ft])),content:se((()=>[w("p",null,[gt,_t,L(" ELO opponent you played was "+v(e.lowest_match.opponent.userName)+" ("+v(e.lowest_match.opponent.id)+") at "+v(e.lowest_match.opponent["match-elo"])+". ",1)]),w("p",null," You were "+v(e.lowest_match.self["match-elo"])+" ("+v(e.lowest_match["elo-diff-formatted"])+") and they are now "+v(e.lowest_match.opponent["current-elo"]),1),w("p",null,[wt,w("b",null,v(e.lowest_match.won?"won":"lost"),1),L(" with a score of "+v(e.formatScore(e.lowest_match)),1)])])),_:1})]),w("div",yt,[w(p,{class:"p-p-4"},{title:se((()=>[vt])),content:se((()=>[w("p",null,[bt,Ot,Et,Dt,L(" would be "+v(e.lowest_now.opponent.userName)+" ("+v(e.lowest_now.opponent.id)+") at "+v(e.lowest_now.opponent["current-elo"])+". ",1)]),w("p",null,[L(" You were "+v(e.lowest_now.self["match-elo"])+" ("+v(e.lowest_now["elo-diff-formatted"])+") and they were "+v(e.lowest_now.opponent["match-elo"])+" when you ",1),Tt,At]),w("p",null,[Lt,w("b",null,v(e.lowest_now.won?"won":"lost"),1),L(" with a score of "+v(e.formatScore(e.lowest_now)),1)])])),_:1})]),w("div",Mt,[w(p,{class:"p-p-4"},{title:se((()=>[Nt])),content:se((()=>["unranked"===e.ranked?(A(),_("div",St,[w("p",null,[xt,L(" matches: "+v(e.most_played.mostPlayed)+" ("+v(e.most_played.mostPlayedData[0].opponent.id)+") with "+v(e.most_played.mostPlayedGames)+" matches, winning "+v(e.most_played.mostPlayedWon)+". ",1)]),w("p",null,[kt,Wt,L(": "+v(e.most_played.mostWon)+" ("+v(e.most_played.mostWonData[0].opponent.id)+") with "+v(e.most_played.mostWonGames)+" matches, winning "+v(e.most_played.mostWonWon)+". ",1)]),w("p",null,[Rt,Gt,L(": "+v(e.most_played.mostLost)+" ("+v(e.most_played.mostLostData[0].opponent.id)+") with "+v(e.most_played.mostLostGames)+" matches, losing "+v(e.most_played.mostLostLost)+". ",1)])])):b("",!0),"unranked"!==e.ranked?(A(),_("div",Vt,[w("p",null,[Ct,L(" matches: "+v(e.most_played.mostPlayed)+" ("+v(e.most_played.mostPlayedData[0].opponent.id)+") with "+v(e.most_played.mostPlayedGames)+" matches, winning "+v(e.most_played.mostPlayedWon)+", with a net ELO change of "+v(e.most_played.mostPlayedEloChange)+". ",1)]),w("p",null,[It,Pt,L(": "+v(e.most_played.mostWon)+" ("+v(e.most_played.mostWonData[0].opponent.id)+") with "+v(e.most_played.mostWonGames)+" matches, winning "+v(e.most_played.mostWonWon)+", with a net ELO change of "+v(e.most_played.mostWonEloChange)+". ",1)]),w("p",null,[Bt,Yt,L(": "+v(e.most_played.mostLost)+" ("+v(e.most_played.mostLostData[0].opponent.id)+") with "+v(e.most_played.mostLostGames)+" matches, losing "+v(e.most_played.mostLostLost)+", with a net ELO change of "+v(e.most_played.mostLostEloChange)+". ",1)])])):b("",!0)])),_:1})]),w("div",Ht,[w(p,{class:"p-p-4"},{title:se((()=>[Ut])),content:se((()=>[Ft,qt,jt,$t,L(" played them is "+v(e.most_improved.firstGame.opponent.userName)+" ("+v(e.most_improved.firstGame.opponent.id)+") ",1),w("p",null,[L(" You were "+v(e.most_improved.firstGame.self["match-elo"])+" ("+v(e.most_improved.firstGame["elo-diff-formatted"])+") and they were "+v(e.most_improved.firstGame.opponent["match-elo"])+" when you ",1),Qt,zt]),w("p",null,[Jt,Kt,L(" to "+v(e.most_improved.firstGame.opponent["current-elo"])+" ("+v(e.most_improved.firstGame.opponent["elo-gain-formatted"])+") ",1)]),e.most_improved.lastGame?(A(),_("p",Xt," You last played at "+v(e.most_improved.lastGame.self["match-elo"])+"-"+v(e.most_improved.lastGame.opponent["match-elo"])+". ",1)):b("",!0)])),_:1})]),w("div",Zt,[w(p,{class:"p-p-4"},{title:se((()=>[eo])),content:se((()=>[to,oo,no,ao,L(" played them is "+v(e.least_improved.opponent.userName)+" ("+v(e.least_improved.opponent.id)+") ",1),w("p",null,[L(" You were "+v(e.least_improved.self["match-elo"])+" ("+v(e.least_improved["elo-diff-formatted"])+") and they were "+v(e.least_improved.opponent["match-elo"])+" when you ",1),lo,so]),w("p",null,[ro,io,L(" to "+v(e.least_improved.opponent["current-elo"])+" ("+v(e.least_improved.opponent["elo-gain-formatted"])+") ",1)])])),_:1})]),"unranked"!==e.ranked?(A(),_("div",uo,[w(p,{class:"p-p-4"},{title:se((()=>[mo])),content:se((()=>[w("p",null," The most ELO you gained is from "+v(e.most_gained_lost.maxName)+" ("+v(e.most_gained_lost.maxId)+"), taking a net "+v(e.most_gained_lost.maxGain)+" from them. ",1),w("p",null," The most ELO you lost is to "+v(e.most_gained_lost.minName)+" ("+v(e.most_gained_lost.minId)+"), losing a net "+v(e.most_gained_lost.minGain)+" to them. ",1)])),_:1})])):b("",!0),w("div",po,[w(p,{class:"p-p-4"},{title:se((()=>[ho])),content:se((()=>[w("p",null,[L(v(e.all_round_stats.matchesTo3)+"% of your matches go to ",1),co,L(". Of those, you won "+v(e.all_round_stats.matchesTo3Won)+"%. ",1)]),w("p",null,[L(v(e.all_round_stats.roundsToOvertime)+"% of your rounds go ",1),fo,L(" 11 points. Of those, you won "+v(e.all_round_stats.roundsToOvertimeWon)+"%. ",1)])])),_:1})]),w("div",go,[w(p,{class:"p-p-4"},{title:se((()=>[_o])),content:se((()=>[w("p",null," Of the remaining "+v(100-Number(e.all_round_stats.matchesTo3))+"% matches that end in 2 rounds (or less??), you won "+v(e.all_round_stats.matchesTo2Won)+"% of them. ",1),w("p",null," You won "+v(e.all_round_stats.hardWonRounds)+" ("+v(e.all_round_stats.hardWonRoundsPercentage)+"%) and lost "+v(e.all_round_stats.hardLostRounds)+" ("+v(e.all_round_stats.hardLostRoundsPercentage)+"%) of your rounds 11-0. ",1)])),_:1})]),w("div",wo,[w(p,{class:"p-p-4"},{title:se((()=>[yo])),content:se((()=>[w("p",null,[vo,bo,Oo,Eo,L(" round, "+v(e.all_round_stats.matchesFirstRoundWon)+"% of them you win in 2 rounds. ",1)]),w("p",null,[Do,To,Ao,Lo,L(" round, "+v(e.all_round_stats.matchesFirstRoundLost)+"% result in a comeback win. ",1)])])),_:1})]),w("div",Mo,[w(p,{class:"p-p-4"},{title:se((()=>[No])),content:se((()=>[w("p",null," The longest round you won ended in "+v(e.all_round_stats.longestRoundWon["score-formatted"])+" against "+v(e.all_round_stats.longestRoundWon["opponent-username"])+" ("+v(e.all_round_stats.longestRoundWon["opponent-id"])+") ",1),w("p",null," The longest round you lost ended in "+v(e.all_round_stats.longestRoundLost["score-formatted"])+" against "+v(e.all_round_stats.longestRoundLost["opponent-username"])+" ("+v(e.all_round_stats.longestRoundLost["opponent-id"])+") ",1)])),_:1})])])])),_:1}),w(g,{header:"Graphs"},{default:se((()=>[w("div",So,[w("div",xo,[w(p,{class:"p-p-4"},{title:se((()=>[ko])),content:se((()=>[Wo])),_:1})])])])),_:1})])),_:1})])):b("",!0)])}));le.render=Ro,le.__scopeId="data-v-c32a7182";var Go=o({name:"App",components:{ElevenStats:le}});Go.render=function(e,t,o,n,a,l){const s=T("ElevenStats");return A(),_(s)};M(Go).use(N).mount("#app");