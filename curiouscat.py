#!/usr/bin/python3

import time
from datetime import datetime
import os

import json
import requests

import argparse

def error(code, call):
  """Formats error message."""

  ERROR_MSG =  """The request failed :(
  Status code: {code}
  API Call:    {call}"""

  return ERROR_MSG.format(code = code, call = call)


def post_name(post):
  """Gets post name"""
  return "{time}-{id}".format(time = datetime.fromtimestamp(post["timestamp"]).strftime('%Y-%m-%d'),
                              id = post["id"])

def create_file(post, *, directory = "_posts"):
  """Creates file for a given post"""
  name = post_name(post)
  with open("{dir}/{name}.md".format(dir = directory, name = name), "w", encoding='utf8') as post_file:
    post_file.write("---\n")
    post_file.write("layout: post\n")
    post_file.write("title: \"{title}\"\n".format(
      title = post["comment"]
      .replace("\\", "\\\\")
      .replace('"', r'\"')
      .replace("\n", r"\n")))

    for key in ["id", "timestamp", "likes"]:
      post_file.write("{key}: {value}\n".format(key = key, value = post[key]))

    post_file.write("---\n\n")
    post_file.write(" " + post["reply"])



def get_posts(username, timestamp):
  """Gets posts from user"""

  API_CALL = "https://api.curiouscat.me/v2/profile?username={user}&count=100&max_timestamp={stamp}"
  eof   = False
  posts = []
  n     = 0
  total = -1

  while not eof:
    request = requests.get(API_CALL.format(user = username, stamp = timestamp))

    if request.status_code != 200:
      print(error(request.status_code, API_CALL.format(user = username, stamp = timestamp)))
      exit()

    if total == -1:
      total = int(request.json()["answers"])

    print("Posts downloaded: {perc:.0%}".format(perc = n/total), end="\r")

    posts_batch = request.json()["posts"]
    posts += posts_batch
    timestamp = posts_batch[-1]["timestamp"] - 1
    eof = len(posts_batch) < 100
    n += len(posts_batch)


  print("Posts downloaded: {perc:.0%}".format(perc = n/total))
  return posts

def get_user_data(username):
  """Gets profile image and banner from user."""
  API_CALL = "https://api.curiouscat.me/v2/profile?username={user}".format(user = username)
  request = requests.get(API_CALL)

  if request.status_code != 200:
    print(error(username, API_CALL))
    exit()

  data = request.json()
  return data



if __name__ == "__main__":
  parser = argparse.ArgumentParser()

  group = parser.add_mutually_exclusive_group()
  group.add_argument("--user",  nargs=1, help="download questions from USER")
  group.add_argument("--load", nargs=1, metavar="FILE", help="load questions from FILE")

  parser.add_argument("--timestamp", metavar="STAMP", help="max STAMP for download", type=float, nargs=1, default=[time.time()])
  parser.add_argument("-d", "--delete", help="Delete post files", action="store_true")
  parser.add_argument("-f", "--files", help="Create file for each post", action="store_true")

  args  = parser.parse_args()
  posts = []

  if args.user:
    posts = get_posts(args.user[0], args.timestamp[0])

    FILE_NAME = "{user}_{stamp}.json".format(user = args.user[0], stamp = time.time())
    with open(FILE_NAME, "w", encoding='utf8') as dump_file:
      dump_file.write(json.dumps(posts, ensure_ascii=False))
    print("Output written to {file}".format(file = FILE_NAME))
  elif args.load:
    with open(args.load[0], "r", encoding='utf8') as dump_file:
      posts = json.load(dump_file)

  if args.delete and os.path.exists("_posts"):
    for f in os.listdir("_posts"):
      os.remove("_posts/" + f)

  if args.files:
    os.makedirs("_posts", exist_ok=True)

    for post in posts:
      create_file(post)
