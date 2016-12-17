# -*- coding: utf-8 -*-
"""
Created on Mon Aug  8 00:38:27 2016

@author: Sriram
"""

#### creates the aggregate functions output using our data

def fillDFs(userData):
    knnAcc = userData['KNNAcc'][0]
    startTuple = [(0, userData['initLayoutPoint'], 'Starting... <br /> 5-NN Accuracy: %.2f'%knnAcc,knnAcc)]
    remainingTuples = []
    for i, points in enumerate(userData['layouts']):
        if userData['undoIndicator'][i] == 1: continue
        featureString = '<b>Top 5 Features</b>: <br> '
        for featureName in userData['topFeatures'][i+1]: #first list is for initial point so we skip that
            featureString = featureString + featureName + '<br> '
        text = '<br><b>DF Number %i </b> <br> <b>5-NN Accuracy: %.2f </b> <br><br> %s'%(i+2, userData['KNNAcc'][i+1], featureString)
        knnAcc = userData['KNNAcc'][i+1]
        remainingTuples.append(((i+1)*5,points,text,knnAcc))
    return startTuple + remainingTuples
    

def fillLines(userData):
    linesLst = []
    pushj = 0
    for i, points in enumerate(userData['layouts']):
        pointsMovedCount = 0
        pointsMovedCountText = ''
        j = i + 1 #the pointsList starts with key 1 not 0
        pointsText = '<b>Points Moved</b> <br> '        
        print j - pushj
        if userData['undoIndicator'][i] == 1: pointAddText = 'None(user used UNDO)'; pushj += 1; print pushj
        else: 
            pointsMovedFullLst = userData['pointsMoved'][j-pushj] # need to go back by pushj amount since pointsMoved dict doesnt take into account undos            
            allEntryLst = []            
            for entry in pointsMovedFullLst:
                subEntryLst = []
                for subEntry in entry:
                    subEntryLst.append(subEntry.split(',')[0])# only the first point of the list is the point ID (the other vals are the pixels)
                allEntryLst.append(subEntryLst)
            
            setVals = {}
            for index, pointSet in enumerate(allEntryLst):# This is done to ensure the sets are divided properly (each line with only have 6 items)
                setVals[index] = '<u>Set%s</u>: <br>'%(index+1)                
                start=0; end = 0
                for cut in range(len(pointSet)//5):
                    start = end
                    end = end + 5
                    setVals[index] += ', '.join(pointSet[start:end]) + '<br>'
                if len(pointSet)%5 != 0: setVals[index] += ', '.join(pointSet[end:end+len(pointSet)%5]) + '<br>'
            set1 = setVals[0]
            set2 = setVals[1]
            pointsMovedCount = sum([len(allEntryLst[index]) for index in range(len(allEntryLst))])
            pointsMovedCountText ='(Total ' + str(pointsMovedCount) + ' points moved)<br>'#Counting the total number of points moved            
            pointAddText = set1 + set2
        totalPointsText = pointsText + pointsMovedCountText + pointAddText
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
        undoInd = False
        if userData['undoIndicator'][i] == 1: undoInd = True
        linesLst.append({'backward': undoInd, 'info':totalPointsText, 
        'x1':x1,'x2':x2,'y1':y1,'y2':y2, 'count':pointsMovedCount})
    return linesLst
    
def DFLinesDict(userData):
    return {'DFs':fillDFs(userData), 'lines':fillLines(userData)}