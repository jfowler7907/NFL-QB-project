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
QBRs = Base.classes.qb_stats4

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


@app.route("/bar/")
def bar():
    """Return a list of all stats"""
    session = Session(engine)
    sel = [Stats.Round_Drafted,func.avg(Stats.Avg_Completions),
    func.avg(Stats.Avg_Passing_Yards),func.avg(Stats.Avg_Yards_per_Attempt),
    func.avg(Stats.Avg_TDs),func.avg(Stats.Avg_Sacks),
    func.avg(Stats.Avg_Loss_of_Yards),func.avg(Stats.Avg_QBR_REAL),
    func.avg(Stats.Avg_Points),func.avg(Stats.Game_Total),
    func.avg(Stats.Avg_Attempts)]

    results = session.query(*sel).group_by(Stats.Round_Drafted).all()

    draft_round = []
    stats_list = []

    for a in results:
        player_dict = {}
        player_dict["Draft_Round"] = a[0]
        player_dict["Avg_Attempts"] = a[1]
        player_dict["Avg_Completions"] = a[2]
        player_dict["Avg_Passing_Yards"] = a[3]
        player_dict["Avg_Yards_per_Attempt"] = a[4]
        player_dict["Avg_TDs"] = a[5]
        player_dict["Avg_Sacks"] = a[6]
        player_dict["Avg_Loss_of_Yards"] = a[7]
        player_dict["Avg_QBR"] = a[8]
        player_dict["Avg_Points"] = a[9]
        player_dict["Game_Total"] = a[10]

        stats_list.append(player_dict)

    return jsonify(stats_list)

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
    rounds = session.query(Stats.Round_Drafted).distinct().order_by(Stats.Round_Drafted.asc())
    roundList = []
    for x in rounds:
        roundList.append(x[0])

    #  Use Pandas to perform the sql query
    #stmt = session.query(Stats.Player).statement
    #df = pd.read_sql_query(stmt, session.bind)

    # Return a list of the column names (sample names)
    return jsonify(roundList)

@app.route("/line/<player>")
def line(player):
    """Return the QBR data by years."""
    session = Session(engine)
    sel = [QBRs.Player, QBRs.Year, QBRs.QBR]
    results = session.query(*sel).filter(QBRs.Player == player).all()
    qbr_list = []
    qb = []

    for result in results:
        qb.append(str(result[0]))
        qbr_dict = {}
        qbr_dict["Player"] = result[0]
        qbr_dict["Year"] = result[1]
        qbr_dict["QRB"] = result[2]
        qbr_list.append(qbr_dict)
    
    return jsonify(qbr_list)
    
if __name__ == '__main__':
    app.run(debug=True)
