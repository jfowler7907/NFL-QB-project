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
    session = Session(engine)
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
    session = Session(engine)

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

    #qbr_years=[]
    qbr_statsAll = []
    #league_stats = []

    for result in results:
        qbr_dict = {}
        #qbr_dict["Player"] = result[0]
        #qbr_dict["Year"] = result[1]
        #qbr_years.append(result[1])
        #qbr_dict["Round_Drafted"] = result[2]
        qbr_dict["Avg_Completions"] = result[3]
        qbr_dict["Avg_Passing_Yards"] = result[4]
        qbr_dict["Avg_Yards_per_Attempt"] = result[5]
        qbr_dict["Avg_TDs"] = result[6]
        qbr_dict["Avg_Sacks"] = result[7]
        qbr_dict["Avg_Loss_of_Yards"] = result[8]
        qbr_dict["Avg_QBR_REAL"] = result[9]
        qbr_dict["Avg_Points"] = result[10]
        qbr_dict["Game_Total"] = result[11]
        qbr_dict["Avg_Attempts"] = result[12]
        qbr_statsAll.append(qbr_dict)
    
    results2 = session.query(*sel2).all()
    #.filter(Stats.Year_Drafted.between(min(qbr_years), max(qbr_years)))
      
    for result in results2:
            #league_stats.append(result[0])
        allStats_dict = {}
        #allStats_dict["QBRs"] = league_stats
        #allStats_dict["Player"] = result[0]
        #allStats_dict["Year"] = result[1]
        #qbr_years.append(result[1])
        #allStats_dict["Round_Drafted"] = result[2]
        allStats_dict["Avg_Completions"] = result[3]
        allStats_dict["Avg_Passing_Yards"] = result[4]
        allStats_dict["Avg_Yards_per_Attempt"] = result[5]
        allStats_dict["Avg_TDs"] = result[6]
        allStats_dict["Avg_Sacks"] = result[7]
        allStats_dict["Avg_Loss_of_Yards"] = result[8]
        allStats_dict["Avg_QBR_REAL"] = result[9]
        allStats_dict["Avg_Points"] = result[10]
        allStats_dict["Game_Total"] = result[11]
        allStats_dict["Avg_Attempts"] = result[12]
        print(allStats_dict)
        qbr_statsAll.append(allStats_dict)
 
    return jsonify(qbr_statsAll)

if __name__ == '__main__':
    app.run(debug=True)
