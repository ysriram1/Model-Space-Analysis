# -*- coding: utf-8 -*-
"""
Created on Mon Aug  8 00:38:27 2016

@author: Sriram
"""

####this script recreates the aggregate functions output using our data


#userData = sampleFile2[1] #Just to test out

def fillDFs(userData):
    startTuple = [(0, userData['initLayoutPoint'], 'Starting...')]
    remainingTuples = []
    for i, points in enumerate(userData['layouts']):
        randomText = 'DF Number %i <br />address shown<br />doc30<br />\
        atlanta bank accounts<br />saudi national<br />weapons<br />denver\
        <br />god\<br />denver bank accounts<br />doc26<br />deposited'%(i+1)
        remainingTuples.append((i*5,points,randomText))
    return startTuple + remainingTuples
    
def fillLines(userData):
    randomText = "From 15:53:00 for 0:10:15<br />Read: attacks targeting\
    oil facilities, saudi national, web site, biological agent testing\
    facility, apiece, guns, break, states, grenades, elected officials,\
    american bank, charged, conspiring, missing, beach, plotted, islamic jihad\
    union, attended training camps, germany, arrested, afghanistan, \
    connections, organization, bombings, connection, aryan brotherhood,\
    denver, investigation, blowing, attack, alberto gonzales describes, \
    arrested yesterday morning, evidence, florida, buildings, atlanta bank \
    accounts<br />Searches: ['BROOKLYN', 'DEFREITAS', 'BROOKLYN', 'ATLANTIC \
    AVENUE', 'BALFOUR']<br />GOs: [{'terms1': 'atlanta bank accounts, aryan \
    brotherhood'}]<br />obs: ['bomb', 'people', 'money', 'arrested', 'other\
    countries', 'weapons', 'Brooklyn', 'spatial', 'CO', 'bank']"
    linesLst = []
    for i, points in enumerate(userData['layouts']):
        if i == 0: 
            x1 = userData['initLayoutPoint'][0]
            y1 = userData['initLayoutPoint'][1]
        else:
            x1 = userData['layouts'][i-1][0]
            y1 = userData['layouts'][i-1][1]
        x2 = userData['layouts'][i][0]
        y2 = userData['layouts'][i][1]
        linesLst.append({'backward': False, 'info':randomText, 
        'x1':x1,'x2':x2,'y1':y1,'y2':y2})
    return linesLst

    
def DFLinesDict(userData):
    return {'DFs':fillDFs(userData), 'lines':fillLines(userData)}