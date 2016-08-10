# -*- coding: utf-8 -*-
"""
Created on Fri Jul 29 19:51:05 2016

@author: Sriram
"""
# input is of the format:
# { uid: {'layouts' -> [ (x,y) ],
#         'terms' -> [ term ],
#         'logs' -> [ (log tuple) ], *(dt, marker, [info])
#         'observations' -> { 'comments': [ comments at end ],
#                             'gender': 'f' or 'm',
#                             'job': str,
#                             'insight_names': [str]
#                             'starttime': dt
#                             'insights': [ { 'insights': { isightname: num },
#                                             'notes': str,
#                                             'time': dt } ]
#                           }
#        }
# }


import pickle
import os
import re
import pandas as pd
import numpy as np
from sklearn.manifold import TSNE
from sklearn.manifold import MDS
import datetime
import random
from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
from sklearn.cross_validation import cross_val_score

#os.chdir('/Users/Sriram/Desktop/DePaul/model-space-analysis')
os.chdir('C:/Users/SYARLAG1/Desktop/Model-Space-Analysis')

sampleFile = pickle.load(open('no15812_newproj.pickle'))

##############################################################################################################
#####Functions to parse the user interaction log files, get the final vectors and perform MDS (or tsne) to get 2D proj

def multiSplit(delimiters, string, maxsplit=0):
    regexPattern = '|'.join(map(re.escape, delimiters))
    return re.split(regexPattern, string, maxsplit)

def logFileParse(fileName):
    global textLst
    text = open(fileName, 'r').read()
    delimiters = '__DICT1__','__DICT2__', 'normed result theta:','Performing CLOSER transform','__END__'
    textLst = multiSplit(delimiters, text)
    vectorLst = []; pointInteractionDict = {}; interactionCount = 0; undoIndicator = []
    for index, line in enumerate(textLst):
        if len(line) == 0: continue
        line = line.replace('\n','')
        if index+1 < len(textLst):
            if 'MovedPointGroupsInteractionDataArray' in  textLst[index+1]:
                if '__UNDO__' in line:
                    lineNew = line.replace('__UNDO__', '')
                    undoIndicator.append(0)
                    vectorLst.append(lineNew.split(','))
                    undoIndicator.append(1)
                    vectorLst.append(vectorLst[-2])
                else:
                    undoIndicator.append(0)
                    vectorLst.append(line.split(','))
            elif 'MovedPointGroupsInteractionDataArray' in  line:
                interactionCount += 1
                pointInteractionDict[interactionCount] = []
                for i in range(index+1,len(textLst)):
                    if 'Running optimization' in textLst[i]: break
                    pointInteractionDict[interactionCount].append(textLst[i].split('\n')[1:-1])
        else:
            if '__UNDO__' in line:
                lineNew = line.replace('__UNDO__', '')
                undoIndicator.append(0)
                vectorLst.append(lineNew.split(',')) 
                undoIndicator.append(1)
                vectorLst.append(vectorLst[-2])
            else:
                undoIndicator.append(0)
                vectorLst.append(line.split(','))
    
    vectorLst.insert(0,[1./len(vectorLst[1])]*len(vectorLst[1]))#Adding the starting point as all 1s
    
    return len(vectorLst), vectorLst, pointInteractionDict, undoIndicator


def knnAccGen(userWList, X, y):
    knnAccLst= []
    knnClf = KNeighborsClassifier(3)
    for weights in userWList:
        weights = np.abs(weights) #setting all negative values to positive (there was only one such val)
        newX = X*np.sqrt(weights)
        score = cross_val_score(knnClf, newX, y, cv=10, scoring='accuracy')
        knnAccLst.append(np.mean(score))
    return knnAccLst
    
def getTopFeatures(userWList, featureLst, numberToPick=5):
    topFeatureLst = []    
    for index, weights in enumerate(userWList):
        if index == 0: topFeatureLst.append('NA All Weights Equal'); continue
        topFeatureLst.append([featureLst[i] for i in weights.argsort()[-numberToPick:][::-1]])
    return topFeatureLst

##################################################################################################################
#####Feature list from the dataset and X and y values from the dataset ################################
featureLst = list(pd.read_csv('./wineplus_cl.csv').columns[1:])

X = np.genfromtxt('./wineplus_cl.csv',delimiter=',', skip_header=1, dtype='float64',\
                    usecols = range(1,24))
                    
y = np.genfromtxt('./wineplus_cl.csv',delimiter=',', skip_header=1, dtype='object',\
                    usecols = 0)

####################Running the function and generating the MDS proj, Nearest Neighbours etc#######

os.chdir('./user_sequence_data')
logFileLst = os.listdir('./')

fullLst = []
lstCounts = {}
pointsMoved = {}
undoIndicatorDict = {} #note that if position 'i' has the 'undo', then position 'i+1' in the indicator has the 1 value
for log in logFileLst:
    name = log[1:2]
    if len(log) == 11: name = log[1:3]
    logSize, logLst, points, undos = logFileParse(log)
    fullLst = fullLst + logLst
    lstCounts[name] = logSize
    pointsMoved[name] = points
    undoIndicatorDict[name] = undos


vectorMat = np.array(fullLst, dtype='float64')
start = 0; end = 0 
lstDict = {}
for logID in ['10','11','1','2','4','5','6','7','8','9']:
    end = end + lstCounts[logID]
    print start, ' ', end
    lstDict[logID] = vectorMat[start:end]
    start = end

knnDict = {}
for logID in lstDict.keys():
    #print logID, np.sum((lstDict[logID]<0),1), lstDict[logID].shape
    knnDict[logID] = knnAccGen(lstDict[logID], X, y)

topFeatureDict = {}
for logID in lstDict.keys():
    topFeatureDict[logID] = getTopFeatures(lstDict[logID], featureLst, numberToPick=5)

##Performing MDS on the entire data:
vectorMat = np.array(fullLst, dtype='float64')
redVectorMat = MDS(n_components=2, random_state=99,dissimilarity='euclidean').fit_transform(vectorMat)
#redVectorMat = PCA(n_components=2).fit_transform(vectorMat)
#redVectorMat = TSNE(n_components=2, random_state=99).fit_transform(vectorMat)

#Making sure that redVec will have the same values when the actual vector has the same values:
changes = 0
for i in range(1,len(vectorMat)):
    for j in range(i+1,len(vectorMat)):
        if np.sum(vectorMat[i] == vectorMat[j]) == len(vectorMat[j]):
            if np.sum(redVectorMat[j] == redVectorMat[i]) < len(redVectorMat[i]):
                changes += 1
                redVectorMat[j] = redVectorMat[i]
        


start = 0; end = 0 
MDSresultDict = {}
for logID in ['10','11','1','2','4','5','6','7','8','9']:
    end = end + lstCounts[logID]
    MDSresultDict[logID] = redVectorMat[start:end]
    start = end

os.chdir('./..')

######################################################################################################
####Randomly generating the logs list in the dictionary
dateTime = []; marker = ['DOC_MOUSEOVER']*len(range(0,501,5)); info = [12,34]*len(range(0,501,5))
a = datetime.datetime(2016,1,1,0,0,0)

for i in range(0,501,5):
    a = a + datetime.timedelta(seconds=5)
    dateTime.append(a.time())

logsRandom = zip(dateTime, marker, info)


#####Randomly generating the insights sub-dictionary

insightNames = featureLst[1:5]

insightsTime = []
b = datetime.datetime(2016,1,1,0,0,1)
for i in range(20):
    a = a + datetime.timedelta(seconds=10)
    insightsTime.append(a.time())

subInsights = {'insights':{random.choice(insightNames):1, 'notes':'xyz', 'time':random.choice(insightsTime)} for x in range(20)}

#######################################################################################################
#############Plotting:
import matplotlib.pyplot as plt
from matplotlib.pyplot import cm 
plt.style.use('ggplot')

colors=cm.rainbow(np.linspace(0,1,10))

fig = plt.figure(figsize=(17,17))
ax = fig.add_subplot(111)

for color, logID in zip(colors,MDSresultDict.keys()):
    name = 'User' + logID
    MDSVals = MDSresultDict[logID]
    ax.scatter(MDSVals[:,0], MDSVals[:,1], color = 'b', s=40)
    ax.plot(MDSVals[:,0], MDSVals[:,1], '-', color = color, label = name, linewidth=4)


ax.legend()
plt.xlabel('MDS Proj 1'); plt.ylabel('MDS Proj 2')
plt.title('MDS Solution Vectors for Diffirent Users of Disfunction')
plt.legend(prop={'size':20}, bbox_to_anchor=(1,1))
plt.tight_layout(pad=7)
plt.savefig('./MDSOutput.png')

    

#########################################################################################################
######Putting it all together for ModelSpace.py:
userModelDict = {}

for logID in MDSresultDict.keys():
    name = int(logID)
    userModelDict[name] = {}
    MDSVals = MDSresultDict[logID]
    MDSValsTuple = [tuple(x) for x in MDSVals]
    userModelDict[name]['KNNAcc'] = knnDict[logID]
    userModelDict[name]['topFeatures'] = topFeatureDict[logID]
    userModelDict[name]['initLayoutPoint'] = MDSValsTuple[0]
    userModelDict[name]['layouts'] = MDSValsTuple[1:]
    userModelDict[name]['terms'] = featureLst
    userModelDict[name]['undoIndicator'] = undoIndicatorDict[logID]
    userModelDict[name]['pointsMoved'] = pointsMoved[logID]
    newLogLst1 = [((datetime.datetime(2016,1,1,0,8,25)+datetime.timedelta(seconds=x)).time(),'GO1',([(123,131),(156,177)],[random.random() for i in range(len(featureLst))])) \
    for x in range(1,(len(MDSValsTuple)-1)*5,5)]
    newLogLst2 = [((datetime.datetime(2016,1,1,0,8,25)+datetime.timedelta(seconds=x+1)).time(),'DF1',[random.random() for i in range(len(featureLst))]) \
    for x in range(1,(len(MDSValsTuple)-1)*5,5)]
    combLogLst = [[newLogLst1[i],newLogLst2[i]] for i in range(len(newLogLst2))]    
    userModelDict[name]['logs'] =sum(combLogLst,[]) #+ logsRandom
    userModelDict[name]['observations'] = {}
    userModelDict[name]['observations']['gender'] = 'm'
    userModelDict[name]['observations']['job'] = 'student'
    userModelDict[name]['observations']['starttime'] = datetime.time(0,0,0)
    userModelDict[name]['observations']['comments'] = insightNames
    userModelDict[name]['observations']['insight_names'] = [[]*7]
    userModelDict[name]['observations']['insights'] = subInsights
    

pFile = open('./userDisfunctionSpace.pickle', 'w')
pickle.dump(userModelDict, pFile)
pFile.close()
sampleFile2 = pickle.load(open('userDisfunctionSpace.pickle'))

#######################################END#######################################################




