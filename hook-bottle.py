# hook-bottle.py

import sys
import bottle

# Ensure bottle handles frozen stdout correctly
if hasattr(sys, '_MEIPASS'):
    bottle.stdout = sys.stdout
