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
import json
import re

def multiSplit(delimiters, string, maxsplit=0):
    import re
    regexPattern = '|'.join(map(re.escape, delimiters))
    return re.split(regexPattern, string, maxsplit)

os.chdir('/Users/Sriram/Desktop/DePaul/model-space-analysis')

sampleFile = pickle.load(open('multiuser357m8.pickle'))

def logFileParse(fileName):
    textLst = open(fileName, 'r').read().split('\n')
    delimiters = '__DICT1__','__DICT2__', 'normed result theta:', \
    'Performing CLOSER transform','__END__'
    for line in textLst
    
    

