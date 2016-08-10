# -*- coding: utf-8 -*-
"""
Created on Mon Aug  8 00:38:27 2016

@author: Sriram
"""

####this script recreates the aggregate functions output using our data


#userData = sampleFile2[1] #Just to test out

def fillDFs(userData):
    startTuple = [(0, userData['initLayoutPoint'], 'Starting... <br /> 5-NN Accuracy: %.2f'%userData['KNNAcc'][0])]
    remainingTuples = []
    for i, points in enumerate(userData['layouts']):
        if userData['undoIndicator'][i] == 1: continue
        featureString = 'Top 5 Features: <br /> '
        for featureName in userData['topFeatures'][i+1]: #first list is for initial point so we skip that
            featureString = featureString + featureName + '<br /> '
        text = 'DF Number %i <br /> 5-NN Accuracy: %.2f <br /> %s'%(i+2, userData['KNNAcc'][i+1], featureString)
        remainingTuples.append((i*5,points,text))
    return startTuple + remainingTuples
    

def fillLines(userData):
    linesLst = []
    for i, points in enumerate(userData['layouts']):
        text = "Accuracy Change: "
        if i == 0: 
            x1 = userData['initLayoutPoint'][0]
            y1 = userData['initLayoutPoint'][1]
        else:
            x1 = userData['layouts'][i-1][0]
            y1 = userData['layouts'][i-1][1]
        x2 = userData['layouts'][i][0]
        y2 = userData['layouts'][i][1]
        accChange = userData['KNNAcc'][i] - userData['KNNAcc'][i-1]
        direction = "increase" if round(accChange,2) >0  else "decrease"
        if round(accChange,2) == 0: direction = "unchanged"
        if round(accChange,2) == 0: accChange = 0
        text = text + "%.2f (%s)"%(accChange,direction)
        undoInd = False
        if userData['undoIndicator'][i] == 1: undoInd = True
        linesLst.append({'backward': undoInd, 'info':text, 
        'x1':x1,'x2':x2,'y1':y1,'y2':y2})
    return linesLst
    
def DFLinesDict(userData):
    return {'DFs':fillDFs(userData), 'lines':fillLines(userData)}