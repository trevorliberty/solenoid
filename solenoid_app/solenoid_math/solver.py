from sympy import symbols, solve
import numpy as np
from time import perf_counter

# Wire Gauge constants for copper
# Resistance per unit length and cross-sectional area
AWGdata = {
    #        mili Ohms / meter     milimeters^2
    "0000": {"resistance": 0.1608, "area": 107},
    "000":  {"resistance": 0.2028, "area": 85.0},
    "00":   {"resistance": 0.2557, "area": 67.4},
    "0":    {"resistance": 0.3224, "area": 53.5},
    "1":    {"resistance": 0.4066, "area": 42.4},
    "2":    {"resistance": 0.5127, "area": 33.6},
    "3":    {"resistance": 0.6465, "area": 26.7},
    "4":    {"resistance": 0.8152, "area": 21.2},
    "5":    {"resistance": 1.028,  "area": 16.8},
    "6":    {"resistance": 1.296,  "area": 13.3},
    "7":    {"resistance": 1.634,  "area": 10.5},
    "8":    {"resistance": 2.061,  "area": 8.37},
    "9":    {"resistance": 2.599,  "area": 6.63},
    "10":   {"resistance": 3.277,  "area": 5.26},
    "11":   {"resistance": 4.132,  "area": 4.17},
    "12":   {"resistance": 5.211,  "area": 3.31},
    "13":   {"resistance": 6.571,  "area": 2.62},
    "14":   {"resistance": 8.286,  "area": 2.08},
    "15":   {"resistance": 10.45,  "area": 1.65},
    "16":   {"resistance": 13.17,  "area": 1.31},
    "17":   {"resistance": 16.61,  "area": 1.04},
    "18":   {"resistance": 20.95,  "area": 0.823},
    "19":   {"resistance": 26.42,  "area": 0.653},
    "20":   {"resistance": 33.31,  "area": 0.518},
    "21":   {"resistance": 42.00,  "area": 0.410},
    "22":   {"resistance": 52.96,  "area": 0.326},
    "23":   {"resistance": 66.79,  "area": 0.258},
    "24":   {"resistance": 84.22,  "area": 0.205},
    "25":   {"resistance": 106.2,  "area": 0.162},
    "26":   {"resistance": 133.9,  "area": 0.129},
    "27":   {"resistance": 168.9,  "area": 0.102},
    "28":   {"resistance": 212.9,  "area": 0.0810},
    "29":   {"resistance": 268.5,  "area": 0.0642},
    "30":   {"resistance": 338.6,  "area": 0.0509},
    "31":   {"resistance": 426.9,  "area": 0.0404},
    "32":   {"resistance": 538.3,  "area": 0.0320},
    "33":   {"resistance": 678.8,  "area": 0.0254},
    "34":   {"resistance": 856.0,  "area": 0.0201},
    "35":   {"resistance": 1079,   "area": 0.0160},
    "36":   {"resistance": 1361,   "area": 0.0127},
    "37":   {"resistance": 1716,   "area": 0.0100},
    "38":   {"resistance": 2164,   "area": 0.00797},
    "39":   {"resistance": 2729,   "area": 0.00632},
    "40":   {"resistance": 3441,   "area": 0.00501}
}

# Permeability constants
# TODO: allow variable relative permeabilities to allow users to match their core
permFree = 1.257 * (10**-6)
permRelative = 350

"""
Solves for a single missing variable within the solenoid force equation.

The variable being solved for is inputed as a None value. All other
arguments are then required and cannot be None

Parameters:
    volts (float | None): Voltage applied to the solenoid - Volts
    length (float | None): Overall length of the solenoid coil - Milimeters
    r0 (float | None): Inner radius of the sloenoid coil - Milimeters
    ra (float | None): Outer radius of the sloenoid coil - Milimeters
    gauge (string): A value between "0000" -> "40"
    location (float | None): Location (Stroke) of the solenoid core within the coil - Milimeters
    force (float | None): The force produced by the solenoid - Newtons

Returns:
    result (float): The solved value of specified variable
"""
def solenoidSolve(volts, length, r0, rA, gauge, location, force):
    
    # verify only 1 argument is being solved for
    noneCount = 0
    for arg in [volts, length, r0, rA, gauge, location, force]:
        if arg is None:
            noneCount += 1
    
    if noneCount > 1:
        raise TooManyVariables

    result = None
    a = np.log(permRelative) 
    f,v,l,R0,RA,x = symbols('f v l R0 RA x')

    # Generalized equation
    eq1 = ((v ** 2) * permRelative * permFree) / (
                    8 * np.pi * ((AWGdata[gauge]["resistance"] / 1000) ** 2) * (
                    (l / 1000) ** 2))
    eq2 = ((R0/1000)**2 / (RA/1000)**2)
    eq3 = np.e**(-(a/(l / 1000)) * (x / 1000))

    # Set equation equal to 0
    originEq = (eq1 * eq2 * eq3 * a) - f

    # Solve for specified variable

    if volts is None:
        originEq = originEq.subs(l,length) 
        originEq = originEq.subs(R0, r0)
        originEq = originEq.subs(RA,rA)
        originEq = originEq.subs(x,location)
        originEq = originEq.subs(f,force)
        result = solve(originEq, v)

    elif length is None:
        originEq = originEq.subs(v,volts)
        originEq = originEq.subs(R0,r0) 
        originEq = originEq.subs(RA,rA)
        originEq = originEq.subs(x,location) 
        originEq = originEq.subs(f,force)
        result = solve(originEq,l)

    elif r0 is None:
        originEq = originEq.subs(v,volts)
        originEq = originEq.subs(RA,rA)
        originEq = originEq.subs(l,length)
        originEq = originEq.subs(x,location)
        originEq = originEq.subs(f,force)
        result = solve(originEq,R0)

    elif rA is None:
        originEq = originEq.subs(v,volts)
        originEq = originEq.subs(R0,r0)
        originEq = originEq.subs(l,length)
        originEq = originEq.subs(x,location) 
        originEq = originEq.subs(f,force)
        result = solve(originEq,RA)

    elif location is None: 
        originEq = originEq.subs(v,volts)
        originEq = originEq.subs(R0,r0)
        originEq = originEq.subs(RA,rA)
        originEq = originEq.subs(l,length)
        originEq = originEq.subs(f,force)
        result = solve(originEq,l)
    
    elif force is None:  
        originEq = originEq.subs(v,volts)
        originEq = originEq.subs(R0,r0)
        originEq = originEq.subs(RA,rA)
        originEq = originEq.subs(x,location)
        originEq = originEq.subs(l,length)
        result = solve(originEq,f)

    # Return the correctly signed value due to solving squares in function
    if len(result) == 2:
        return result[1]
    else:
        return result[0]

class TooManyVariables(Exception):
    """Exception raised when too many variables are inputted

    Attributes:
        message -- Too many variables to solve for. Only one variable can be None
    """
    def __init__(self):
        self.message = "Too many variables to solve for. Only one variable can be None"
        super().__init__(self.message)
