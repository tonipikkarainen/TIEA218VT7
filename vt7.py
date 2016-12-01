#!/usr/bin/python
# -*- coding: utf-8 -*-
# Videovuokraamon käyttöliittymän palvelinpuolen ohjelmakoodi
# tiea218 viikkotehtävä 7
# Author: Toni Pikkarainen
# Date: 1.11.2016

from functools import wraps
from flask import Flask, session, redirect, url_for, escape, request, Response, render_template, make_response
import sqlite3
import hashlib
import logging
import os
import json
import datetime
import time
import sys

logging.basicConfig(filename=os.path.abspath('../../hidden/vt5/flask.log'),level=logging.DEBUG)
app = Flask(__name__) 
app.debug = True
app.secret_key = '7wZ]\x89\xc3z\xb8\x97\xba|\x95\xa2x\xf6lP\xaas\xbf\xe7\x93\xf32'

# Suorittaa kyselyn kursorilla   
def teeKysely(sql, virheTeksti, cur):
    try:
        cur.execute(sql)
    except Exception as e:
        logging.debug(virheTeksti)
        logging.debug(str(e))

# Luo yhteyden tietokantaan.
def connect():
    try:
        con = sqlite3.connect(os.path.abspath('../../hidden/vt5/video'))
        con.row_factory = sqlite3.Row
        con.text_factory = str
    except Exception as e:
        logging.debug("Kanta ei aukea")
        # sqliten antama virheilmoitus:
        logging.debug(str(e))
    return con
    

@app.route('/vuokraamo', methods=['POST','GET']) 
def vuokraamo():
 
    return render_template('vuokraamo.html')
    
@app.route('/hae_vuokraukset', methods=['GET'])   
def hae_vuokraukset():  
    con = connect() # avataan yhteys
    cur = con.cursor() # luodaan kursori
    
    kirjaus=""
    

   
    # Kysytään jäsenet ja niihin liittyvät vuokraukset.
    sql = """
    SELECT Jasen.nimi AS jasen,Jasen.JasenID as jid,Elokuva.Nimi AS elokuva,Elokuva.ElokuvaID as eid,Vuokraus.VuokrausPVM AS vpvm,
    Vuokraus.PalautusPVM as ppvm
    FROM Jasen 
    LEFT OUTER JOIN Elokuva
    ON Elokuva.ElokuvaID=Vuokraus.ElokuvaID 
    LEFT OUTER JOIN Vuokraus 
    ON Vuokraus.JasenID=Jasen.JasenID
    ORDER BY Jasen.nimi ASC, Vuokraus.VuokrausPVM ASC
    """
    vuokraukset=[]
    jvuok = []
    teeKysely(sql,"Ei löydy vuokraustietoja",cur)
    data=cur.fetchall()
    # Kysely palauttaa kaikki jäsenet.
    # Rakennetaan JSON-muodosso palautettava tietorakenne:
    # Lista[dict(alkio1=alkio1,..., Lista[dict(),...]),dict(),....]
    # On aika monimutkainen ja voisi kenties sieventää, mutta toimii
    # eri variaatioilla. (yksi jäsen, jolla ei vuokrauksia, viimeisellä jäsenellä ei vuokrauksia
    # jne...) 
    # Tuottaa nätin JSON-rakenteen.
    edellinen_id=0
    edjasen=""
    i=0
    for row in data:
        # eka muttei vika
        if i==0 and len(data)>1:
            vuokraukset=vuokraukset
        # eka ja vika    
        elif i==0 and len(data)==1:
            vuokraukset.append(dict(jasen=row['jasen'].decode("UTF-8"),
            jid=row['jid'], jvuok=jvuok))
        # vika ja sama kuin edellinen ja on vuokraus    
        elif i==(len(data)-1) and row['jid']==edellinen_id and row['vpvm']:
            jvuok.append(dict(elokuva=row['elokuva'].decode("UTF-8"),
            vpvm=row['vpvm'].decode("UTF-8"),ppvm=row['ppvm'].decode("UTF-8"),eid=row['eid']))
            
            vuokraukset.append(dict(jasen=edjasen,jid=edellinen_id, jvuok=jvuok))
        # vika ja sama kuin edellinen ja ei vuokrausta      
        elif i==(len(data)-1) and row['jid']==edellinen_id:
            vuokraukset.append(dict(jasen=row['jasen'],jid=row['jid'], jvuok=jvuok))
        
        # vika mutta eri kuin edellinen ja on vuokraus   
        elif i==(len(data)-1) and row['jid']!=edellinen_id and row['vpvm']:    
            vuokraukset.append(dict(jasen=edjasen,jid=edellinen_id, jvuok=jvuok))
            jvuok=[]
            jvuok.append(dict(elokuva=row['elokuva'].decode("UTF-8"),
            vpvm=row['vpvm'].decode("UTF-8"),ppvm=row['ppvm'].decode("UTF-8"),eid=row['eid']))
            
            vuokraukset.append(dict(jasen=row['jasen'].decode("UTF-8"),
            jid=row['jid'], jvuok=jvuok))
        # vika mutta eri kuin edellinen ja ei vuokrausta
        elif i==(len(data)-1) and row['jid']!=edellinen_id:
            vuokraukset.append(dict(jasen=edjasen,jid=edellinen_id, jvuok=jvuok))
            jvuok=[]
            vuokraukset.append(dict(jasen=row['jasen'].decode("UTF-8"),
            jid=row['jid'], jvuok=jvuok))
       
        # jos sama kuin edellinen ja on vuokraus    
        elif row['jid']==edellinen_id and row['vpvm']:
            jvuok.append(dict(elokuva=row['elokuva'].decode("UTF-8"),
            vpvm=row['vpvm'].decode("UTF-8"),
            ppvm=row['ppvm'].decode("UTF-8"),eid=row['eid']))
        
        elif row['jid']==edellinen_id:
            vuokraukset=vuokraukset
        # ollaan keskellä listaa ja tulee erilainen jäsen
        else:
            vuokraukset.append(dict(jasen=edjasen,jid=edellinen_id, jvuok=jvuok))
            jvuok=[]
        
        edellinen_id=row['jid']
        edjasen=row['jasen']
        i+=1
    
    
    con.close() 
    resp = make_response( json.dumps( vuokraukset ))
    resp.charset = "UTF-8"
    resp.mimetype = "application/json"
        
    return resp
    #resp = make_response( render_template("vuokraukset.xml",vuokraukset=vuokraukset,kirjaus=kirjaus))
    #resp.charset = "UTF-8"
    #resp.mimetype = "text/xml"
    #return resp
    
    # Hakee elokuvat kannasta
@app.route('/hae_elokuvat', methods=['GET'])     
def hae_elokuvat():
    con = connect()
    
    cur = con.cursor()
    
    
    sql = """
    SELECT Nimi, ElokuvaID
    FROM Elokuva
    """
    elokuvat = []
    
    try:
        cur.execute(sql)
    except Exception as e:
        logging.debug("ei löydy elokuvia")
        logging.debug(str(e))
    
    for row in cur.fetchall():
        elokuvat.append(dict(nimi=row['Nimi'].decode("utf-8"), id=row['ElokuvaID']))
   
    con.close()
    resp = make_response( json.dumps( elokuvat ))
    resp.charset = "UTF-8"
    resp.mimetype = "application/json"
        
    return resp
   
   
    # Hakee elokuvat kannasta
@app.route('/hae_jasenet', methods=['GET'])     
def hae_jasenet():
    con = connect()
    
    cur = con.cursor()
    
    
    sql = """
    SELECT Nimi, JasenID, Osoite, LiittymisPVM, Syntymavuosi
    FROM Jasen
    """
    jasenet = []
    
    try:
        cur.execute(sql)
    except Exception as e:
        logging.debug("ei löydy jasenia")
        logging.debug(str(e))
    
    for row in cur.fetchall():
        jasenet.append(dict(nimi=row['Nimi'].decode("utf-8"), id=row['JasenID'], liittymispvm=row['LiittymisPVM'],
        syntymavuosi=row['Syntymavuosi'], osoite=row['Osoite'].decode("utf-8")))
   
    con.close()
    resp = make_response( json.dumps( jasenet ))
    resp.charset = "UTF-8"
    resp.mimetype = "application/json"
        
    return resp
    
  
    

    
if __name__ == '__main__':
    app.debug = True
    app.run(debug=True)