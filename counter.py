# -*- coding: utf-8 -*-
"""
Created on Sat Sep 10 15:08:23 2016

@author: SYARLAG1
"""

import pickle
import os
import numpy as np

os.chdir('C:/Users/SYARLAG1/Desktop/Model-Space-Analysis')

userData = pickle.load(open('userDisfunctionSpace.pickle','r'))


minAcc = 0 #0.90014
maxAcc = 0 #0.972
minMoveCount = 0
maxMoveCount = 0
for user in userData.keys():
    tempMaxAcc = np.array(userData[user]['KNNAcc']).max()
    tempMinAcc = np.array(userData[user]['KNNAcc']).min()
    if minAcc > tempMinAcc:
        minAcc = tempMinAcc
    if maxAcc < tempMaxAcc:
        maxAcc = tempMaxAcc
