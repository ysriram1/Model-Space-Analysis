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


os.chdir('/Users/Sriram/Desktop/DePaul/model-space-analysis')
#os.chdir('C:/Users/SYARLAG1/Desktop/Model-Space-Analysis')

sampleFile = pickle.load(open('no15812_newproj.pickle'))

#####Feature list from the dataset

featureLst = list(pd.read_csv('./wineplus_cl.csv').columns[1:])

#####Functions to parse the user interaction log files, get the final vectors and perform MDS (or tsne) to get 2D proj

def multiSplit(delimiters, string, maxsplit=0):
    regexPattern = '|'.join(map(re.escape, delimiters))
    return re.split(regexPattern, string, maxsplit)

def logFileParse(fileName, random_state=99, reductionMethod = 'mds'):
    text = open(fileName, 'r').read()
    delimiters = '__DICT1__','__DICT2__', 'normed result theta:','Performing CLOSER transform','__END__'
    textLst = multiSplit(delimiters, text)
    vectorLst = []
    for index, line in enumerate(textLst):
        if len(line) == 0: continue
        line = line.replace('\n','')
        if index+1 < len(textLst):
            if 'MovedPointGroupsInteractionDataArray' in  textLst[index+1]:
                if '__UNDO__' in line: 
                    lineNew = line.replace('__UNDO__', '')
                    vectorLst.append(lineNew.split(','))
                    vectorLst.append(vectorLst[-2])
                else:
                    vectorLst.append(line.split(','))
        else:
            if '__UNDO__' in line:
                lineNew = line.replace('__UNDO__', '')
                vectorLst.append(lineNew.split(',')) 
                vectorLst.append(vectorLst[-2])
            else:
                vectorLst.append(line.split(','))
    vectorMat = np.array(vectorLst, dtype='float64')
    if reductionMethod == 'tsne': redVectorMat = TSNE(n_components=2, random_state=random_state).fit_transform(vectorMat)
    if reductionMethod == 'mds': 
        redVectorMat = MDS(n_components=2, random_state=random_state,dissimilarity='euclidean').fit_transform(vectorMat)
    return redVectorMat


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


######Putting it all together
os.chdir('./user_sequence_data')
logFileLst = os.listdir('./')

userModelDict = {}

for log in logFileLst:
    name = log[1:2]
    if len(log) == 11: name = log[1:3]
    userModelDict[name] = {}
    MDSVals = logFileParse(log) 
    MDSValsTuple = [tuple(x) for x in MDSVals] 
    userModelDict[name]['initLayoutPoint'] = MDSValsTuple[0]
    userModelDict[name]['layouts'] = MDSValsTuple[1:]
    userModelDict[name]['terms'] = featureLst
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
    

os.chdir('./..')
pFile = open('./userDisfunctionSpace.pickle', 'w')
pickle.dump(userModelDict, pFile)
pFile.close()
sampleFile2 = pickle.load(open('userDisfunctionSpace.pickle'))


#############Plotting:
import matplotlib.pyplot as plt
from matplotlib.pyplot import cm 
plt.style.use('ggplot')

os.chdir('./user_sequence_data')
logFileLst = os.listdir('./')


colors=cm.rainbow(np.linspace(0,1,10))

fig = plt.figure(figsize=(17,17))
ax = fig.add_subplot(111)

for color, log in zip(colors,logFileLst):
    name = 'User ' + log[1:2]
    if len(log) == 11: name = 'User ' + log[1:3]
    MDSVals = logFileParse(log)
    ax.scatter(MDSVals[:,0], MDSVals[:,1], color = color)
    ax.plot(MDSVals[:,0], MDSVals[:,1], '-', color = color, label = name, linewidth=4)

ax.legend()
plt.xlabel('MDS Proj 1'); plt.ylabel('MDS Proj 2')
plt.title('MDS Solution Vectors for Diffirent Users of Disfunction')
plt.legend(prop={'size':20}, bbox_to_anchor=(1,1))
plt.tight_layout(pad=7)
plt.savefig('./MDSOutput.png')

    



