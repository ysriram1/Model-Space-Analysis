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


#os.chdir('/Users/Sriram/Desktop/DePaul/model-space-analysis')
os.chdir('C:/Users/SYARLAG1/Desktop/Model-Space-Analysis')

sampleFile = pickle.load(open('multiuser357m8.pickle'))

featureLst = list(pd.read_csv('./wineplus_cl.csv').columns[1:])


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

logLst = logFileParse('log.txt') 



