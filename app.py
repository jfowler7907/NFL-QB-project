##################################################
#Import Dependencies
##################################################
import os
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template
import sqlite3
import pandas as pd
from flask_sqlalchemy import SQLAlchemy

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///nfl_etl.sqlite"
db = SQLAlchemy(app)
#engine = create_engine("sqlite:///nfl_etl.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to the table
Stats = Base.classes.qb_stats2
QBRs = Base.classes.qb_stats4

# Create our session (link) from Python to the DB
session = Session(db.engine)


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
    session = Session(db.engine)
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
        player_dict["Avg_Attempts"] = a[10]
        player_dict["Avg_Completions"] = a[1]
        player_dict["Avg_Passing_Yards"] = a[2]
        player_dict["Avg_Yards_per_Attempt"] = a[3]
        player_dict["Avg_TDs"] = a[4]
        player_dict["Avg_Sacks"] = a[5]
        player_dict["Avg_Loss_of_Yards"] = a[6]
        player_dict["Avg_QBR"] = a[7]
        player_dict["Avg_Points"] = a[8]
        player_dict["Game_Total"] = a[9]

        stats_list.append(player_dict)

    return jsonify(stats_list)

@app.route("/search/")
def search():
    return render_template("search.html")


@app.route("/names")
def names():
    """Return a list of player names."""
    session = Session(db.engine)
    players = session.query(Stats.Player).all()
    playerList = []
    for x in players:
        playerList.append(str(x[0]))

    # Return a list of the column names (sample names)
    return jsonify(playerList)

@app.route("/rounds")
def rounds():
    """Return a list of player names."""
    session = Session(db.engine)
    rounds = session.query(Stats.Round_Drafted).distinct().order_by(Stats.Round_Drafted.asc())
    roundList = []
    for x in rounds:
        roundList.append(x[0])



    # Return a list of the column names (sample names)
    return jsonify(roundList)

@app.route("/line/<player>")
def line(player):
    """Return the QBR data by years."""
    session = Session(db.engine)
    sel = [QBRs.Player, QBRs.Year, QBRs.QBR]
    sel2 = [QBRs.Year, QBRs.QBR]
    results = session.query(*sel).filter(QBRs.Player == player).all()
    qbr_years=[]
    qbr_list = []
    league_qbr = []
    for result in results:
        qbr_dict = {}
        qbr_dict["Player"] = result[0]
        qbr_dict["Year"] = result[1]
        qbr_years.append(result[1])
        qbr_dict["QBR"] = result[2]
        qbr_list.append(qbr_dict)
    results2 = session.query(func.avg(QBRs.QBR)).filter(QBRs.Year.between(min(qbr_years), max(qbr_years))).group_by(QBRs.Year).all()
    for result in results2:
        league_qbr.append(result[0])
    qbr_dict = {}
    qbr_dict["QBRs"] = league_qbr
    print(qbr_dict)
    qbr_list.append(qbr_dict)

    return jsonify(qbr_list)

@app.route("/statsTable/<round>")
def statsTable(round):
    session = Session(db.engine)
    sel = [
        Stats.Player,
        Stats.Year_Drafted,
        Stats.Round_Drafted,
        Stats.Overall_Pick,
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
    results = session.query(*sel).filter(Stats.Round_Drafted == round).all()
    stat_table = []

    for result in results:
        stats_dict = {}
        stats_dict["Player"] = result[0]
        stats_dict["Year_Drafted"] = result[1]
        stats_dict["Round_Drafted"] = result[2]
        stats_dict["Overall_Pick"] = result[3]
        stats_dict["Avg_Attempts"] = result[4]
        stats_dict["Avg_Completions"] = result[5]
        stats_dict["Avg_Passing_Yards"] = result[6]
        stats_dict["Avg_Yards_per_Attempt"] = result[7]
        stats_dict["Avg_TDs"] = result[8]
        stats_dict["Avg_Sacks"] = result[9]
        stats_dict["Avg_Loss_of_Yards"] = result[10]
        stats_dict["Avg_QBR_REAL"] = result[11]
        stats_dict["Avg_Points"] = result[12]
        stats_dict["Game_Total"] = result[13]
        stat_table.append(stats_dict)


    return jsonify(stat_table)

@app.route("/doubleBar/<player>")
def doubleBar(player):
    """Return the QBR data by years."""
    session = Session(db.engine)

    sel = [Stats.Player, Stats.Year_Drafted,Stats.Round_Drafted,Stats.Avg_Completions,
    Stats.Avg_Passing_Yards,Stats.Avg_Yards_per_Attempt,
    Stats.Avg_TDs,Stats.Avg_Sacks,Stats.Avg_Loss_of_Yards,Stats.Avg_QBR_REAL,
    Stats.Avg_Points,Stats.Game_Total,Stats.Avg_Attempts]

    sel2 = [Stats.Player, Stats.Year_Drafted,Stats.Round_Drafted,func.avg(Stats.Avg_Completions),
    func.avg(Stats.Avg_Passing_Yards),func.avg(Stats.Avg_Yards_per_Attempt),
    func.avg(Stats.Avg_TDs),func.avg(Stats.Avg_Sacks),
    func.avg(Stats.Avg_Loss_of_Yards),func.avg(Stats.Avg_QBR_REAL),
    func.avg(Stats.Avg_Points),func.avg(Stats.Game_Total),
    func.avg(Stats.Avg_Attempts)]

    results = session.query(*sel).filter(Stats.Player == player).all()

    qb_statsAll = []


    for result in results:
        qb_dict = {}
        qb_dict["Avg_Completions"] = result[3]
        qb_dict["Avg_Passing_Yards"] = result[4]
        qb_dict["Avg_Yards_per_Attempt"] = result[5]
        qb_dict["Avg_TDs"] = result[6]
        qb_dict["Avg_Sacks"] = result[7]
        qb_dict["Avg_Loss_of_Yards"] = result[8]
        qb_dict["Avg_QBR_REAL"] = result[9]
        qb_dict["Avg_Points"] = result[10]
        qb_dict["Game_Total"] = result[11]
        qb_dict["Avg_Attempts"] = result[12]
        qb_statsAll.append(qb_dict)
    
    results2 = session.query(*sel2).all()
      
    for result in results2:
        qb_dict = {}
        qb_dict["Avg_Completions_All"] = result[3]
        qb_dict["Avg_Passing_Yards_All"] = result[4]
        qb_dict["Avg_Yards_per_Attempt_All"] = result[5]
        qb_dict["Avg_TDs_All"] = result[6]
        qb_dict["Avg_Sacks_All"] = result[7]
        qb_dict["Avg_Loss_of_Yards_All"] = result[8]
        qb_dict["Avg_QBR_REAL_All"] = result[9]
        qb_dict["Avg_Points_All"] = result[10]
        qb_dict["Game_Total_All"] = result[11]
        qb_dict["Avg_Attempts_All"] = result[12]
        print(qb_dict)
        qb_statsAll.append(qb_dict)
 
    return jsonify(qb_statsAll)

if __name__ == '__main__':
    app.run(debug=True)
