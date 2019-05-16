##################################################
#Import Dependencies
##################################################
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template
import sqlite3
import pandas as pd


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///nfl_etl.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to the table
Stats = Base.classes.qb_stats2

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################

@app.route("/")
def home():
    """List all available api routes."""
    return render_template("index.html")


# @app.route("/api/v1.1/jsonified")
# def stations():
#     """Return a list of all stations"""
#     session = Session(engine)
#     results = session.query(Stats.Player,Stats.Year_Drafted, Stats.Round_Drafted,
#                             Stats.Overall_Pick, Stats.Draft_Position,
#                             Stats.Avg_Attempts, Stats.Avg_Completions,
#                             Stats.Avg_Passing_Yards, Stats.Avg_Yards_per_Attempt,
#                             Stats.Avg_TDs, Stats.Avg_Sacks, Stats.Avg_Loss_of_Yards,
#                             Stats.Avg_QBR_REAL, Stats.Avg_Points, Stats.Game_Total ).all()
#
#     player_names = []
#     stats_list = []
#     player_dict = {}
#
#     for a in results:
#         player_names.append(str(a[0]))
#
#     # for a in player_names:
#     # for a,b,c,d,e,f,g,h,i,j,k,l,m,n,o in results:
#     #     roster_dict["Player"]=a
#     for a,b,c,d,e,f,g,h,i,j,k,l,m,n,o in results:
#         player_dict["Year_Drafted"] = b
#         player_dict["Round_Drafted"] = c
#         player_dict["Overall_Pick"] = d
#         player_dict["Draft_Position"] = e
#         player_dict["Avg_Attempts"] = f
#         player_dict["Avg_Completions"] = g
#         player_dict["Avg_Passing_Yards"] = h
#         player_dict["Avg_Yards_per_Attempt"] = i
#         player_dict["Avg_TDs"] = j
#         player_dict["Avg_Sacks"] = k
#         player_dict["Avg_Loss_of_Yards"] = l
#         player_dict["Avg_QBR"] = m
#         player_dict["Avg_Points"] = n
#         player_dict["Game_Total"] = o
#
#
#         stats_list.append(player_dict)
#     nfl_dict = dict(zip(player_names,stats_list))
#
#     return jsonify(nfl_dict)
#
@app.route("/search/")
def search():
    return render_template("search.html")
 #     # session = Session(engine)
 #     # results2 = session.query(Stats.Player,Stats.Year_Drafted, Stats.Round_Drafted,
 #     #                         Stats.Overall_Pick, Stats.Draft_Position,
 #     #                         Stats.Avg_Attempts, Stats.Avg_Completions,
 #     #                         Stats.Avg_Passing_Yards, Stats.Avg_Yards_per_Attempt,
 #     #                         Stats.Avg_TDs, Stats.Avg_Sacks, Stats.Avg_Loss_of_Yards,
 #     #                         Stats.Avg_QBR_REAL, Stats.Avg_Points, Stats.Game_Total ).filter(Stats.Year_Drafted==2005).all()
 #
 #
 #


@app.route("/search/<stats>")
def qb_stats2(stats):
    #Return the round for a given player
    session=Session(engine)
    sel = [
        Stats.stats,
        Stats.Player,
        Stats.Year_Drafted,
        Stats.Round_Drafted,
        Stats.Overall_Pick,
        Stats.Draft_Position,
        Stats.Avg_Attempts,
        Stats.Avg_Completions,
        Stats.Avg_Passing_Yards,
        Stats.Avg_Yards_per_Attempt,
        Stats.Avg_TDs,
        Stats.Avg_Sacks,
        Stats.Avg_Loss_of_Yards,
        Stats.Avg_QBR_REAL,
        Stats.Avg_Points,
        Stats.Game_Total,
    ] 

    results = session.query(*sel).filter(Stats.stats == stats).groupby("Round_Drafted")


@app.route("/names")
def names():
    """Return a list of player names."""
    session = Session(engine)
    players = session.query(Stats.Player).all()
    playerList = []
    for x in players:
        playerList.append(str(x[0]))

    #  Use Pandas to perform the sql query
    #stmt = session.query(Stats.Player).statement
    #df = pd.read_sql_query(stmt, session.bind)

    # Return a list of the column names (sample names)
    return jsonify(playerList)

@app.route("/rounds")
def rounds():
    """Return a list of player names."""
    session = Session(engine)
    rounds = session.query(Stats.Round_Drafted).distinct()
    roundList = []
    for x in rounds:
        roundList.append(x[0])

    #  Use Pandas to perform the sql query
    #stmt = session.query(Stats.Player).statement
    #df = pd.read_sql_query(stmt, session.bind)

    # Return a list of the column names (sample names)
    return jsonify(roundList)

if __name__ == '__main__':
    app.run(debug=True)
