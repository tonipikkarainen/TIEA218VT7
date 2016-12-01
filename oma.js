// Videovuokraamon käyttöliittymä react.js - sovelluksena
// Author: Toni Pikkarainen
// 30.11.2016

/* Yleisiä kommentteja:
Sain tehtyä yleiskäyttöisen select-komponentin jota käytän
kaikissa select-elementeissä. Sain myös tehtyä yleiskäyttöisen 
komponentin, jota käytän uuden vuokraajan lisäämiseen ja vanhan
vuokraajan muokkaamiseen.
TODO: 
Selkeästi sovellusta voisi parantaa siten, että tehtäisiin yleiskäyttöinen
komponentti, jolla voi lisätä uuden vuokrauksen, muokata vanhaa vuokrausta
ja jota voi käyttää myös yhden jäsenen kaikkien vuokrausten muokkaamisessa.
Tätä en ehtinyt nyt tehdä, vaan näissä kaikissa tapauksissa käytän hiukan
erilaisia komponentteja.
Tähän liittyen ylimmällä tasolla (jossa on koko tila), voisi olla hyvä tehdä
yleiskäyttöinen vuokrausChange-funktio, joka osaisi kohteen identifioimalla
päivittää oikeaa vuokrauksen tilaa. Nyt käytössä on monta erillistä change-funktiota.
Lisäksi muutaman muunkin funktion voisi yhdistää.

Validointi on myös tässä todella alkeellinen, käytän uusia HTML5-kenttätyyppejä(esim. date)
ja tein itse alkeellisen validoinnin, joka tarkistaa että päivämäärä on edes sinnepäin ja
antaa ilmoituksen jos näin ei ole. En käyttänyt tähän enempää aikaa, koska se ei 
tehtävän päätarkoitus ollut.

Lisäksi en lisännyt päivämäärän validointia vuokrausten muokkaukseen, koska niiden ollessa
eri komponentteja olisin vaan joutunut kopioimaan samaa asiaa paikasta toiseen.
Tämä olisi järkevämpää hoitaa siten, että tehtäisiin em. yleiskäyttöinen komponentti
vuokrausten muokkaamiseen/lisäämiseen ja validointi tulisi siitä automaattisesti mukaan
kaikkiin tilanteisiin. 
*/


//Tämä luokka pitää yllä koko sivun tilaa
class KokoSivu extends React.Component{
  constructor() {
    super();
    this.kaannaElokuvat = this.kaannaElokuvat.bind(this);
    this.lisaaVuokraus = this.lisaaVuokraus.bind(this);
    this.selectJChange = this.selectJChange.bind(this);
    this.selectEChange = this.selectEChange.bind(this);
    this.lisaaJasen=this.lisaaJasen.bind(this);
    this.jarjesta_laskevaksi=this.jarjesta_laskevaksi.bind(this);
    this.jarjesta_nousevaksi=this.jarjesta_nousevaksi.bind(this);
    this.muokkaaVuok=this.muokkaaVuok.bind(this);
    this.muokkaaVuokraus=this.muokkaaVuokraus.bind(this); 
    this.muokkaaJas=this.muokkaaJas.bind(this); 
    this.inputVChange=this.inputVChange.bind(this); 
    this.inputPChange=this.inputPChange.bind(this); 
    this.jasenChange=this.jasenChange.bind(this); 
    this.muokkaaJasen=this.muokkaaJasen.bind(this);
    this.vuokrausChange=this.vuokrausChange.bind(this);
    this.jasenenVuokraukset=this.jasenenVuokraukset.bind(this);
    this.muokkaaKaikkiVuokraukset=this.muokkaaKaikkiVuokraukset.bind(this);
    this.poistaVuokraus=this.poistaVuokraus.bind(this);
    this.validateDate=this.validateDate.bind(this);
    this.jasenUusiChange=this.jasenUusiChange.bind(this);
    
    this.state = {
         vuokraukset: [],
         jasenVuokraukset:[],
         elokuva_nous: true,
         elokuvat: [],
         jasenet:[],
         paivitysJid:-1,
         paivitysEid:-1,
         valittuJid:-1,
         valittuEid:-1,
         valittuVpvm:"",
         valittuPpvm:"",
         uusiVpvm:"",
         uusiPpvm:"",
         naytaMuokkaus: false,
         naytaMuokkausJas: false,
         muokattavaJasen:{},
         validVpvm:true,
         validJasen:true,
         validElokuva:true,
         validLpvm:true,
         uusiJasen:{
             "nimi":"",
             "osoite":"",
             "liittymispvm":"",
             "syntymavuosi":"",
         }
     };
    
   
  }
  
  // Poistaa vuokrauksen
  // Käytetään tapahtuman kohteen id:tä vuokrauksen tunnistamiseen
  poistaVuokraus(e){
      e.preventDefault();
      if (window.confirm("Haluatko poistaa vuokrauksen?")) { 
            var num=[e.target.id];
            var initVuokraukset=this.jasenenVuokraukset(this.state.muokattavaJasen.id);
            var jid =initVuokraukset[num].jid;
            var eid=initVuokraukset[num].eid;
            var vpvm=initVuokraukset[num].vpvm;
            
            var vuokraukset = this.state.vuokraukset.slice();
            
            for(var i=0;i<vuokraukset.length;i++) {
                if (vuokraukset[i].jid == jid){
                    //alert(jasen);
                    for(var j=0;j<vuokraukset[i].jvuok.length;j++) {
                        if(vuokraukset[i].jvuok[j].eid==eid 
                        && vuokraukset[i].jvuok[j].vpvm==vpvm){
                            vuokraukset[i].jvuok.splice( j, 1 );
                            
                        }
                    }  
                }
            }
            
            var jas_v=this.jasenenVuokraukset(jid);
            
            
            this.setState({
                vuokraukset:vuokraukset,
                jasenVuokraukset:jas_v,
            });
            localStorage.setItem('vuokraukset', JSON.stringify(vuokraukset));
      }
  }
  
  // Tähän tullaan, kun klikataan vuokrausta vuokrauslistasta.
  // Tallennetaan tilaan päivitettävä arvot ja uudet arvot.
  // Kun vuokrausta muokataan erillisellä lomakkeella se muuttaa 
  // uusia arvoja. 
  // TODO: Fiksumpi tapa voisi olla, että tekisi tilaan yhden objektin, joka pitäisi sisällään
  // nämä vanhat ja uudet arvot
  muokkaaVuok(jid,eid,vpvm,ppvm){  
    this.setState({paivitysJid:jid,paivitysEid:eid,valittuJid:jid,valittuEid:eid,
    valittuVpvm:vpvm,valittuPpvm:ppvm,uusiVpvm:vpvm,uusiPpvm:ppvm, naytaMuokkaus:true,
    validVpvm:true,
         validJasen:true,
         validElokuva:true,
         validLpvm:true,
         });   
  }
  
  
  //Voidaan muokata yhtä vuokrausta viemällä vanhat tiedot ja uudet tiedot
  muokkaaVuokraus(vpvm,ppvm,jid,eid, vanhaVpvm, vanhaPvm,vanhaJid, vanhaEid){
      var jasen="";
      var elokuva="";
      
      for(var i=0;i<this.state.jasenet.length;i++) {
          if(this.state.jasenet[i].id==jid){
              jasen=this.state.jasenet[i].nimi;
          }
      }
      
      for(var i=0;i<this.state.elokuvat.length;i++) {
          if(this.state.elokuvat[i].id==eid){
              elokuva=this.state.elokuvat[i].nimi;
          }
      }
      
      var vuokraukset = this.state.vuokraukset.slice();     
      for(var i=0;i<vuokraukset.length;i++) {
        if (vuokraukset[i].jid == vanhaJid){
            //alert(jasen);
            for(var j=0;j<vuokraukset[i].jvuok.length;j++) {
                if(vuokraukset[i].jvuok[j].eid==vanhaEid 
                && vuokraukset[i].jvuok[j].vpvm==vanhaVpvm){
                    vuokraukset[i].jvuok.splice( j, 1 );                  
                }
            }  
        }
      }
      
      for(var i=0;i<vuokraukset.length;i++) {
        if (vuokraukset[i].jid == jid){
            vuokraukset[i].jvuok.push({"eid":eid,
            "elokuva":elokuva, "ppvm":ppvm, "vpvm":vpvm})                  
             }
       }  
        
      
        if(!this.state.elokuva_nous){
           vuokraukset=this.jarjesta_laskevaksi(vuokraukset);
        }
        else{
           vuokraukset=this.jarjesta_nousevaksi(vuokraukset);
        }
      this.setState({naytaMuokkaus:false, valittuJid:-1,
        valittuEid:-1, vuokraukset:vuokraukset});
      localStorage.setItem('vuokraukset', JSON.stringify(vuokraukset));
  }
  
  // Muokkaa kaikkia yhden jäsenen vuokrauksia kerralla
  muokkaaKaikkiVuokraukset(){
      // Haetaan muokattavan jäsenen vuokraukset alkuperäisistä vuokrauksista
      var initVuokraukset=this.jasenenVuokraukset(this.state.muokattavaJasen.id);
      // Otetaan muuttujaan muutetut jäsenen vuokraukset
      var jv=this.state.jasenVuokraukset;
      for(var i=0;i<jv.length;i++) {
           //viedään muokkaaVuokraukselle vanhat ja uudet tiedot
           this.muokkaaVuokraus(jv[i].vpvm,jv[i].ppvm,jv[i].jid,jv[i].eid,
           initVuokraukset[i].vpvm,initVuokraukset[i].ppvm,initVuokraukset[i].jid,
           initVuokraukset[i].eid)
      }
      this.setState({
          validLpvm:true,
          naytaMuokkausJas:false
      });
  }
  
  // Muokkaa valittua jäsentä
  muokkaaJasen(){
      
      var muokattavaJasen=this.state.muokattavaJasen;
      var jasenet=this.state.jasenet;
      var vuokraukset=this.state.vuokraukset.slice();
      var lpvm=muokattavaJasen.liittymispvm;
     
      this.setState({
          validLpvm:this.validateDate(lpvm),
      });
      if(this.validateDate(lpvm)){
            
            for(var i=0;i<vuokraukset.length;i++) {
                if(vuokraukset[i].jid==muokattavaJasen.id){
                    vuokraukset[i].jasen=muokattavaJasen.nimi;
                }
            }
            
            for(var i=0;i<jasenet.length;i++) {
                if (jasenet[i].id==muokattavaJasen.id){
                    jasenet[i].nimi=muokattavaJasen.nimi;
                    jasenet[i].osoite=muokattavaJasen.osoite;
                    jasenet[i].liittymispvm=muokattavaJasen.liittymispvm;
                    jasenet[i].syntymavuosi=muokattavaJasen.syntymavuosi;
                }  
            }
            this.setState({
                jasenet:jasenet,
                vuokraukset:vuokraukset,
                naytaMuokkausJas:false
            });
            localStorage.setItem('vuokraukset', JSON.stringify(vuokraukset));
            localStorage.setItem('jasenet', JSON.stringify(jasenet));
      }
  }
  
  // Palauttaa id:tä vastaavan jäsenen vuokraukset
  jasenenVuokraukset(jid){
      var v=this.state.vuokraukset.slice();
      var jas_v=[];
      for(var i=0;i<v.length;i++){
          if(v[i].jid==jid){
              var jvuok=v[i].jvuok;
              for(var j=0;j<jvuok.length;j++){
                 jas_v.push({"jid":parseInt(jid),"eid":jvuok[j].eid,
                 "vpvm":jvuok[j].vpvm,"ppvm":jvuok[j].ppvm}) 
              }
              
          }
      }
      return jas_v;
  }
  
  // Kun jäsentä klikataan vuokrauslistauksessa tullaan tähän.
  // Asettaa klikatun muokattavaksiJaseneksi.
  // Asettaa kyseisen jäsenen vuokraukset jasenVuokrauksiksi
  muokkaaJas(jid){
      var muokattavaJasen={};
      for(var i=0;i<this.state.jasenet.length;i++) {
        if (this.state.jasenet[i].id==jid){
            muokattavaJasen=this.state.jasenet[i];
            }  
        }
      
      var jas_v=this.jasenenVuokraukset(jid);
      
      this.setState({
          muokattavaJasen:muokattavaJasen,
          naytaMuokkaus: false,
          naytaMuokkausJas:true,
          jasenVuokraukset:jas_v,
          valittuJid:-1,
          valittuEid:-1,
          validLpvm:true,
          validVpvm:true,
          validJasen:true,
          validElokuva:true,
          uusiJasen:{
             "nimi":"",
             "osoite":"",
             "liittymispvm":"",
             "syntymavuosi":"",
         }
      });
  }
  
  // Lisää uuden jäsenen
  lisaaJasen(){
      var nimi=this.state.uusiJasen.nimi;
      var osoite=this.state.uusiJasen.osoite;
      var lpvm=this.state.uusiJasen.liittymispvm;
      var svuosi=this.state.uusiJasen.syntymavuosi;
      
      this.setState({
          validLpvm:this.validateDate(lpvm),
      });
      if(this.validateDate(lpvm)){
        var uusiId=0;
        var suurin=0;
        for(var i=0;i<this.state.jasenet.length;i++) {
        if (this.state.jasenet[i].id>suurin){
            suurin=this.state.jasenet[i].id;
            }  
        }
        uusiId = suurin+1;
        var jas = this.state.jasenet.slice();
        var v=this.state.vuokraukset.slice();
        
        jas.push({"id":uusiId,"nimi":nimi, "osoite":osoite, "liittymispvm":lpvm, "syntymavuosi":svuosi});
        v.push({"jid":uusiId,"jasen":nimi, "jvuok":[]});
        
        v.sort(function(a, b) {
        var nameA = a.jasen.toUpperCase(); // ignore upper and lowercase
        var nameB = b.jasen.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
    
        return 0;
        });
        
        this.setState({jasenet:jas, vuokraukset:v,});
        localStorage.setItem('vuokraukset', JSON.stringify(v));
        localStorage.setItem('jasenet', JSON.stringify(jas));
      }
  }
  // Muuttaa uusiVuokrauspvm arvoa. Tätä kutsutaan jos ollaan
  // muokkaamassa vuokrausta ja muutetaan vuokrauspäivämäärää
  // TODO: voisi tehdä yhden change-funktion joka 
  // esimerkiksi tapahtumankohteen id:n perusteella osaisi muuttaa
  // oikeaa arvoa uusivuokraus-objektissa. (pitäisi siis olla uusiVuokraus-objekti)
  inputVChange(e){
      this.setState({uusiVpvm: e.target.value});
  }
  // kts. edellinen
  inputPChange(e){
      this.setState({uusiPpvm: e.target.value});
  }
  // Muuttaa valittuna olevan jäsenen id:tä.
  selectJChange(e){
      if([e.target.name] == "jasen"){
        this.setState({valittuJid: e.target.value});
      }
      else{
          var num = parseInt([e.target.name]);
          var jv=this.state.jasenVuokraukset.slice();
          //tarkistus, että sopiva indeksi..
          jv[num].jid=e.target.value;
          this.setState({jasenVuokraukset: jv});
      }
  }
  // Muuttaa muokattavan jäsenen tietoja.
  // TODO: tällä idealla voisi tehdä yleiskäyttöisen
  // Change-funktion. Eli otetaan kohteesta joku identifioiva attribuutti,
  // ja kun tilaan on nimetty muutettavan objektin ominaisuudet samalla
  // systeemillä, niin voitaisiin tämän identifioinnin perusteella muuttaa oikeaa arvoa.
  jasenChange(e){
     var muutos=[e.target.name];
     
     var jasen=Object.assign({}, this.state.muokattavaJasen);
     jasen[muutos]=e.target.value;
     
     this.setState({muokattavaJasen: jasen});    
  }
  
  // TODO: yhdistä edellisen kanssa
  jasenUusiChange(e){
     var muutos=[e.target.name];
     
     var jasen=Object.assign({}, this.state.uusiJasen);
     jasen[muutos]=e.target.value;
     
     this.setState({uusiJasen: jasen});    
  }
  
  // Yhdistä muiden change-funktioiden kanssa
  selectEChange(e){
      if([e.target.name] == "elokuva"){
        this.setState({valittuEid: e.target.value});
      }
      else{
          var num = parseInt([e.target.name]);
          var jv=this.state.jasenVuokraukset.slice();
          //tarkistus, että sopiva indeksi..
          jv[num].eid=e.target.value;
          this.setState({jasenVuokraukset: jv});
      }
  }
  // kts. edelliset
  vuokrausChange(e){
      var num=parseInt([e.target.name]);
      var jv=this.state.jasenVuokraukset.slice();
      var kentta=[e.target.id];
      jv[num][kentta]=e.target.value;
      this.setState({jasenVuokraukset: jv});
  }
  // TODO: kunnollinen validointi, nyt tarkistaa vain, että on sinnepäin.
  // En viitsinyt tähän käyttää aikaa tässä tehtävässä, kun
  // pääpaino ei ollut validoinnissa.
  validateDate(pvm){
  var dateRegex = /[0-9][0-9][0-9][0-9]-[01][0-9]-[0-3][0-9]/;
      return dateRegex.test(pvm);       
  }

  // Lisää vuokrauksen.
  // Tullaan tähän kun painetaan submit uusiVuokraus lomakkeella
  lisaaVuokraus(vpvm, ppvm){
      this.setState({
          validVpvm:this.validateDate(vpvm),
      });
      if(this.state.valittuJid<0 ){
          this.setState({
              validJasen:false,
          })
      }else{
          this.setState({
              validJasen:true,
          })
      }
      
      if(this.state.valittuEid<0 ){
          this.setState({
              validElokuva:false,
          })
      }else{
          this.setState({
              validElokuva:true,
          })
      }
     
      if(this.state.valittuJid >0 && this.state.valittuEid >0 && this.validateDate(vpvm)){
        var eid=this.state.valittuEid;
        var jid=this.state.valittuJid;
        var elokuva;
        var vuokraukset = this.state.vuokraukset.slice();
        
        for(var i=0;i<this.state.elokuvat.length;i++) {
        if (this.state.elokuvat[i].id==eid){
            elokuva=this.state.elokuvat[i].nimi;
            }  
        }
        
        for(var i=0;i<vuokraukset.length;i++) {
        if (vuokraukset[i].jid==jid){
            vuokraukset[i].jvuok.push({"eid":eid,"elokuva":elokuva, "ppvm":ppvm, "vpvm":vpvm})
            }  
        }
        
        if(!this.state.elokuva_nous){
           vuokraukset=this.jarjesta_laskevaksi(vuokraukset);
        }
        else{
           vuokraukset=this.jarjesta_nousevaksi(vuokraukset);
        }
        
        this.setState({vuokraukset: vuokraukset,valittuJid:-1,
        valittuEid:-1,  });
        localStorage.setItem('vuokraukset', JSON.stringify(vuokraukset));
      }
      
  }
  
  // Järjestää elokuvat laskevaksi.
  jarjesta_laskevaksi(v){
      for(var i=0;i<v.length;i++) {
          v[i].jvuok.sort(function(a,b){
              return new Date(b.vpvm) - new Date(a.vpvm);
                }
           );
       }
       return v;
  }
  // TODO: yhdistä edellisen kanssa
  jarjesta_nousevaksi(v){
      for(var i=0;i<v.length;i++) {
          v[i].jvuok.sort(function(a,b){
              return new Date(a.vpvm) - new Date(b.vpvm);
                }
           );
       }
       return v;
  }
  // Kääntää elokuvat päinvastaiseen järjestykseen kun ne sillä hetkellä ovat
  kaannaElokuvat() {
      var v = this.state.vuokraukset.slice();
      if(this.state.elokuva_nous){
           v=this.jarjesta_laskevaksi(v);
      }
      else{
          v=this.jarjesta_nousevaksi(v);
      }
    this.setState({
        vuokraukset: v,
        elokuva_nous: !this.state.elokuva_nous,
  });
 
  localStorage.setItem('vuokraukset', JSON.stringify(v));

}
  
  componentDidMount(){
      $.ajax({
      url:"/~totapikk/cgi-bin/vt7/flask.cgi/hae_vuokraukset" ,
      dataType: 'json',
      cache: false,
      success: function(data) {
        if(!JSON.parse(localStorage.getItem('vuokraukset'))){
            this.setState({vuokraukset: data});
        }
        else{
            this.setState({vuokraukset: JSON.parse(localStorage.getItem('vuokraukset'))});
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(status, err.toString());
      }.bind(this)
    });
    $.ajax({
      url:"/~totapikk/cgi-bin/vt7/flask.cgi/hae_elokuvat" ,
      dataType: 'json',
      cache: false,
      success: function(data) {
        // data sisältää json-datan
        this.setState({elokuvat: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(status, err.toString());
      }.bind(this)
    });
     $.ajax({
      url:"/~totapikk/cgi-bin/vt7/flask.cgi/hae_jasenet" ,
      dataType: 'json',
      cache: false,
      success: function(data) {
        // data sisältää json-datan
        if(!JSON.parse(localStorage.getItem('vuokraukset'))){
            this.setState({jasenet: data});
        }
        else{
            this.setState({jasenet: JSON.parse(localStorage.getItem('jasenet'))});
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(status, err.toString());
      }.bind(this)
    });
  }

    
  render() {
   
    return (
      <div className="sisalto">
        {!this.state.naytaMuokkausJas ?
        <UusiVuokrausJasen muutaJasen={this.lisaaJasen} jasen={this.state.uusiJasen} 
        jasenChange={this.jasenUusiChange} validLpvm={this.state.validLpvm} 
        validJasen={this.state.validJasen} 
        validElokuva={this.state.validElokuva}
        validVpvm={this.state.validVpvm} paivitysJid={this.state.paivitysJid} 
        paivitysEid={this.state.paivitysEid} inputVChange={this.inputVChange} 
        inputPChange={this.inputPChange}
        muokkaaVuokraus={this.muokkaaVuokraus} 
        naytaMuokkaus={this.state.naytaMuokkaus} valittuJid={this.state.valittuJid}
        valittuEid={this.state.valittuEid} lisaaJasen={this.lisaaJasen}
        selectEChange={this.selectEChange} selectJChange={this.selectJChange}
        lisaaVuokraus={this.lisaaVuokraus} jasenet={this.state.jasenet} elokuvat={this.state.elokuvat}
        valittuVpvm={this.state.uusiVpvm} vanhaVpvm={this.state.valittuVpvm} 
        vanhaPpvm={this.state.valittuPpvm} valittuPpvm={this.state.uusiPpvm} /> :null}
        
        <Vuokraukset hideButton={this.state.naytaMuokkausJas} muokkaaJas={this.muokkaaJas} muokkaaVuok={this.muokkaaVuok}
        vuokraukset={this.state.vuokraukset} onClick={() => this.kaannaElokuvat()}/>
        
        {this.state.naytaMuokkausJas ? <MuokkausJas muokkaaJasen={this.muokkaaJasen} jasenChange={this.jasenChange}
        muokattavaJasen={this.state.muokattavaJasen} validLpvm={this.state.validLpvm}
        selectJChange={this.selectJChange} 
        selectEChange={this.selectEChange}
        elokuvat={this.state.elokuvat} jasenet={this.state.jasenet} 
        jasenVuokraukset={this.state.jasenVuokraukset} vuokrausChange={this.vuokrausChange}
        muokkaaKaikkiVuokraukset={this.muokkaaKaikkiVuokraukset} 
        poistaVuokraus={this.poistaVuokraus}/> : null}
        
      </div>
    );

  }
}

// Listaa vuokraukset
class Vuokraukset extends React.Component {
  render() {
     var aputaulukko = [];
     var v = this.props.vuokraukset;

     for(var i=0;i<v.length;i++) {
         
          aputaulukko.push( <Apuluokka muokkaaJas={this.props.muokkaaJas}
          muokkaaVuok={this.props.muokkaaVuok} key={v[i].jid} taulukko={v[i].jvuok}
          ulompi={v[i].jasen} jid={v[i].jid}/>);
     }
     return (
      <div className="vuokraukset"> 
      <ul>
      { aputaulukko }
      </ul>
      {!this.props.hideButton ?
      <button onClick={() => this.props.onClick()}>Käännä elokuvat</button>
      :null
      }
      </div>
    
    );
  }
}

// Käytetään tätä apuna kaksitasoisen listan luomiseen.
class Apuluokka extends React.Component{
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleJasClick = this.handleJasClick.bind(this);
  }
  
  handleClick(event) {
    event.preventDefault();
    var data=event.currentTarget.dataset;
    this.props.muokkaaVuok(data.jid,data.eid,data.vpvm,data.ppvm ); // kutsutaan Kokosivun funktiota
  }
  
  handleJasClick(event){
      event.preventDefault();
      var data=event.currentTarget.dataset;
      this.props.muokkaaJas(data.jid);
  }
  
  render() {
    var jid=this.props.jid;    
    var aputaulukko=this.props.taulukko.map(function(alkio, i) {
        return <li key={i}> <a onClick={this.handleClick} href="#" data-jid={jid}
        data-eid={alkio.eid} value="testi" data-vpvm={alkio.vpvm} 
        data-ppvm={alkio.ppvm}>{alkio.elokuva} | {alkio.vpvm}
        |{alkio.ppvm} </a></li>;
    },this);
    return (
      <li>
       <a onClick={this.handleJasClick} href="#" data-jid={jid}> {this.props.ulompi} </a>
          <ul>
              { aputaulukko }
          </ul>
      </li>
    );

  }
}

//Tähän on upotettu uuden jäsenen lisäys, uuden vuokrauksen lisäys ja vuokrauksen muokkaus
class UusiVuokrausJasen extends React.Component{
  render() {   
    return (
      <div className="uusiVuokrausJasen">
        <UusiVuokraaja validLpvm={this.props.validLpvm} submitValue="Lisää jäsen" 
        muutaJasen={this.props.muutaJasen} jasen={this.props.jasen} jasenChange={this.props.jasenChange} />
        { this.props.naytaMuokkaus ? <MuokkaaVuokraus paivitysJid={this.props.paivitysJid}
            paivitysEid={this.props.paivitysEid}
        inputVChange={this.props.inputVChange} 
        inputPChange={this.props.inputPChange} vanhaVpvm={this.props.vanhaVpvm} 
        vanhaPpvm={this.props.vanhaPpvm}
        valittuEid={this.props.valittuEid} valittuJid={this.props.valittuJid} 
        selectJChange={this.props.selectJChange} selectEChange={this.props.selectEChange}
        muokkaaVuokraus={this.props.muokkaaVuokraus} 
        elokuvat={this.props.elokuvat} jasenet={this.props.jasenet} valittuVpvm={this.props.valittuVpvm}
        valittuPpvm={this.props.valittuPpvm} /> : 
        
        <UusiVuokraus validVpvm={this.props.validVpvm} validElokuva={this.props.validElokuva}
        validJasen={this.props.validJasen}
        valittuEid={this.props.valittuEid} valittuJid={this.props.valittuJid}
        selectJChange={this.props.selectJChange} selectEChange={this.props.selectEChange}
        lisaaVuokraus={this.props.lisaaVuokraus} 
        elokuvat={this.props.elokuvat} jasenet={this.props.jasenet}/> }
      </div>
    );
  }
}

// Tähän on upotettu jäsenen muokkaus ja jäsenen vuokrausten muokkaus
class MuokkausJas extends React.Component{
    render() {
    return (
      <div className="uusiVuokrausJasen">
        <UusiVuokraaja validLpvm={this.props.validLpvm} submitValue="Muokkaa jäsen" 
        muutaJasen={this.props.muokkaaJasen} jasen={this.props.muokattavaJasen} 
        jasenChange={this.props.jasenChange} />
        
        <VuokrausLomakkeet poistaVuokraus={this.props.poistaVuokraus} muokkaaKaikkiVuokraukset={this.props.muokkaaKaikkiVuokraukset} selectJChange={this.props.selectJChange} 
        selectEChange={this.props.selectEChange}
        elokuvat={this.props.elokuvat} jasenet={this.props.jasenet} 
        jasenVuokraukset={this.props.jasenVuokraukset} vuokrausChange={this.props.vuokrausChange} />
      </div>
    );

  }
}

// Yleiskäyttöinen select-elementti.
// Tätä käytetään sovelluksen kaikissa select-elementeissä.
class Select extends React.Component{
  render() {
     
     var aputaulukko=this.props.sisalto.map(function(alkio, i) {
        return <option key={alkio.id} value={alkio.id}>{alkio.nimi}</option>;
    }); 
     return (
        <div id={this.props.div_id}>
            <label htmlFor = {this.props.id}>{this.props.label}</label>
            <select className={this.props.valid ? '' : 'has-error'} value={this.props.valittu.toString()} defaultValue={this.props.valittu.toString()} id={this.props.id} name={this.props.id} onChange={this.props.selectChange}>
                <option value="-1" disabled>--</option>
                {aputaulukko}
            </select>
            {this.props.valid ? null : <span>Valitse yksi</span>}
        </div>
     );
  }
}

// Komponentti uuden vuokrauksen lisäämiseen
class UusiVuokraus extends React.Component{
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(event) {
    event.preventDefault();
    this.props.lisaaVuokraus(this.vpvm.value,this.ppvm.value); // kutsutaan Kokosivun funktiota
  }
  
  
  render() {
   
    return (
        <form action="#" method="post" onSubmit={this.handleSubmit} > 
           
            <Select valid={this.props.validJasen} selectChange={this.props.selectJChange} valittu={this.props.valittuJid} div_id="jasen_info" id="jasen" sisalto={this.props.jasenet} label="Jäsenet"/>
            <Select valid={this.props.validElokuva} selectChange={this.props.selectEChange} valittu={this.props.valittuEid} div_id="elokuva_info" id="elokuva" sisalto={this.props.elokuvat} label="Elokuva"/>
           
            
            <div id="vpvm_info">
            <label htmlFor="vpvm">Vuokrauspäivämäärä</label>
            <input className={this.props.validVpvm ? '' : 'has-error'} type="date" id="vpvm" required name="vpvm" size="20" maxLength="10" ref={(vpvm) => this.vpvm = vpvm}/>
            {this.props.validVpvm ? null : <span>Anna muodossa VVVV-KK-PP</span>}
            </div >
            <div id="ppvm_info">
            <label htmlFor="ppvm">Palautuspäivämäärä</label>
            <input type="date"  id="ppvm" name="ppvm" size="20" maxLength="10" ref={(ppvm) => this.ppvm = ppvm}/>
            </div>
        <input type="submit" name="lisaa_vuokraus" id="lisaa_vuokraus" value="Lisää vuokraus" />
      </form>
    );

  }
}

// Komponentti, jota käytetään kun halutaan muokata kaikkia jäsenen
// vuokrauksia yhdellä kertaa.
// Tämä on siis se yhden vuokrauksen muokkauslomake.
class VuokrausKentat extends React.Component{

  render() {

    return (
        <div > 
           
            <Select valid={true} selectChange={this.props.selectJChange}
            valittu={this.props.valittuJid} div_id="jasen_info" 
            id={this.props.num} sisalto={this.props.jasenet} label="Jäsenet"/>
            
            <Select valid={true}  selectChange={this.props.selectEChange
            } valittu={this.props.valittuEid} div_id="elokuva_info" 
            id={this.props.num} sisalto={this.props.elokuvat} label="Elokuva"/>
          
            <div id="vpvm_info">
            <label htmlFor="vpvm">Vuokrauspäivämäärä</label>
            <input onChange={this.props.vuokrausChange} 
            value={this.props.vpvm} type="date" id="vpvm" 
            required name={this.props.num.toString()} 
            size="20" maxLength="10" ref={(vpvm) => this.vpvm = vpvm}/>
            
            </div >
            <div id="ppvm_info">
            <label htmlFor="ppvm">Palautuspäivämäärä</label>
            <input onChange={this.props.vuokrausChange} 
            value={this.props.ppvm} type="date"  id="ppvm" 
            name={this.props.num.toString()} size="20" 
            maxLength="10" ref={(ppvm) => this.ppvm = ppvm}/>
            </div>
            
            <button onClick={this.props.poistaVuokraus}
            id={this.props.num.toString()}>Poista</button>
      
      </div>
    );

  }
}

// Tällä listataan muokattavaksi kaikki yhden jäsenen vuokraukset.
class VuokrausLomakkeet extends React.Component {
    
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(event) {
    event.preventDefault();
    this.props.muokkaaKaikkiVuokraukset(); // kutsutaan Kokosivun funktiota
  }
  render() {
     var aputaulukko = [];
     var v = this.props.jasenVuokraukset;
     
     for(var i=0;i<v.length;i++) {
          aputaulukko.push( <VuokrausKentat 
          poistaVuokraus={this.props.poistaVuokraus} key={i} valittuEid={v[i].eid} 
          valittuJid={v[i].jid} 
        selectJChange={this.props.selectJChange} selectEChange={this.props.selectEChange}
        elokuvat={this.props.elokuvat} jasenet={this.props.jasenet} 
        vpvm={v[i].vpvm}
        ppvm={v[i].ppvm} num={i} vuokrausChange={this.props.vuokrausChange} />);
     }
     return (
      <form action="#" method="post" onSubmit={this.handleSubmit}> 
      
      { aputaulukko }
      
      <input type="submit" name="lisaa_vuokraus" id="lisaa_vuokraus" value="Muokkaa" />
      </ form>
    
    );
  }
}

// yksittäisen vuokrauksen muokkaus
class MuokkaaVuokraus extends React.Component{
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(event) {
    event.preventDefault();
    this.props.muokkaaVuokraus(this.vpvm.value,this.ppvm.value,
    this.props.valittuJid, this.props.valittuEid,
    this.props.vanhaVpvm, this.props.vanhaPpvm, 
    this.props.paivitysJid, this.props.paivitysEid); // kutsutaan Kokosivun funktiota
  }
  
  
  render() {
   
    return (
        <form action="#" method="post" onSubmit={this.handleSubmit} > 
           
            <Select valid={true} selectChange={this.props.selectJChange} 
            valittu={this.props.valittuJid} div_id="jasen_info" 
            id="jasen" sisalto={this.props.jasenet} label="Jäsenet"/>
            
            <Select valid={true} selectChange={this.props.selectEChange} 
            valittu={this.props.valittuEid} div_id="elokuva_info"
            id="elokuva" sisalto={this.props.elokuvat} label="Elokuva"/>
           
            
            <div id="vpvm_info">
            <label htmlFor="vpvm">Vuokrauspäivämäärä</label>
            <input onChange={this.props.inputVChange} 
            value={this.props.valittuVpvm} type="date" id="vpvm"
            required name="vpvm" size="20" maxLength="10" ref={(vpvm) => this.vpvm = vpvm}/>
            
            </div >
            <div id="ppvm_info">
            <label htmlFor="ppvm">Palautuspäivämäärä</label>
            <input onChange={this.props.inputPChange} value={this.props.valittuPpvm}
            type="date"  id="ppvm" name="ppvm" size="20" maxLength="10" 
            ref={(ppvm) => this.ppvm = ppvm}/>
            </div>
        <input type="submit" name="muokkaa_vuokraus" id="muokkaa_vuokraus" value="Muokkaa vuokrausta" />
      </form>
    );

  }
}

// Yleiskäyttöinen komponentti uuden jäsen lisäämiseen ja
// jäsenen muokkaamiseen.
class UusiVuokraaja extends React.Component{
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(event) {
    event.preventDefault();
    this.props.muutaJasen(); // kutsutaan Kokosivun funktiota
  }
  
  render() {
    var jasen=this.props.jasen;
    return (
      <form action="#" method="post" className="uusiVuokraaja" onSubmit={this.handleSubmit} > 
        <p><label htmlFor="nimi">Nimi:</label><input value={jasen.nimi}
        onChange={this.props.jasenChange} id="nimi"
        required type="text" name="nimi"  /></p> 
        
        <p><label htmlFor="os">Osoite:</label> <input value={jasen.osoite} onChange={this.props.jasenChange}
        id="os" required 
        type="text" name="osoite" /></p>
        
        <p><label htmlFor="lpvm">Liittymispäivämäärä:</label> <input  
        onChange={this.props.jasenChange} value={jasen.liittymispvm} 
        className={this.props.validLpvm ? '' : 'has-error'} 
        id="lpvm" 
        required type="date" name="liittymispvm" />
        
        {this.props.validLpvm ? null : <span>Anna muodossa VVVV-KK-PP</span>}</p>
        
        <p><label htmlFor="svuosi">Syntymävuosi:</label> 
        <input value={jasen.syntymavuosi} 
        onChange={this.props.jasenChange} id="svuosi" required type="text" name="syntymavuosi" 
         /></p>
        <input type="submit" name="lisaa_jasen" id="lisaa_jasen" value={this.props.submitValue} />
      </form>
    );

  }
}


ReactDOM.render(
    <KokoSivu />,
    document.getElementById('main')
);