""" uploading images to django learned from
https://www.youtube.com/watch?v=O5YkEFLXcRg
"""

import json
from django.shortcuts import render, HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.db import IntegrityError
from django.http import JsonResponse

import datetime

from .forms import Login, Register
from .models import User, Article, Comment, Images, Materials, Replies


def index(request):
    """ Renders the Home page with a list of all articles """
    return render(request, "wiki/index.html", {
        "articles": Article.objects.all()
    })


def login_view(request):
    """ Renders the login form """
    if request.method == "POST":
        email = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "wiki/login.html", {
                "error": "Invalid email and/or password"
            })
    else:
        return render(request, "wiki/login.html", {
            "login_form": Login()
        })


def logout_view(request):
    """ Logs out the current user """
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    """ Allows a user to register an account """
    if request.method == "POST":
        email = request.POST["email"]
        username = request.POST["username"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "wiki/register.html", {
                "message": "Passwords must match"
            })
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError as error:
            print(error)
            return render(request, "wiki/register.html", {
                "message": "Try another email address"
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "wiki/register.html", {
            "register_form": Register()
        })


def get_articles(request, id):
    """ Retrieves articles to display on a user's
    profile page with infinite scroll in groups of ten
    """
    start = int(request.GET.get("start")) - 1
    end = int(request.GET.get("end"))
    articles = Article.objects.filter(poster_id=id).order_by('-timestamp')

    article_list = []
    for item in articles[start:end]:
        article_list.append(item.serialize())

    max_reached = False
    if len(article_list) == 0:
        max_reached = True
    
    return JsonResponse({
        "start": start,
        "end": end,
        "articles": article_list,
        "max_reached": max_reached
    }, safe=False)


def profile(request, id):
    """ Renders a user's profile page """
    profile = User.objects.get(pk=id)
    articles = Article.objects.filter(poster_id=id)
    followers = profile.followers.all()
    following = profile.following.all()
    liked = profile.liked.all()

    return render(request, "wiki/profile.html", {
        "profile": profile,
        "num_articles": len(articles),
        "followers": followers,
        "following": len(following),
        "liked": len(liked)
    })


@login_required
def new_article(request):
    """ Renders the page to create a new article """
    return render(request, "wiki/new-article.html")


@login_required
def save_article(request):
    """ Saves a new article to the database.
    data include any amount of user determined steps,
    any amount of user determined materials,
    and step-associated images
    """
    if request.method == "POST":
        body = request.POST.getlist("step")
        images = request.FILES.getlist("image-input")
        materials = request.POST.getlist("materials")

        steps = {}
        for step in body:
            steps[f"Step {body.index(step) + 1}"] = step

        title = request.POST["title"]
        thumbnail = request.FILES.get("thumbnail")

        new_article = Article(
            title=title,
            poster=request.user,
            body=json.dumps(steps),
            timestamp=datetime.datetime.now(),
            thumbnail=thumbnail
        )
        new_article.save()

        for image in images:
            new_image = Images(
                article=new_article,
                images=image
            )
            new_image.save()

        new_materials = Materials(
            article=new_article,
            materials=json.dumps(materials)
        )
        new_materials.save()

        return HttpResponseRedirect(reverse(
            "article",
            args=(new_article.id,)
        ))


def article_view(request, id):
    """Renders the page for an individual article.
    Each step includes the text of that step and an
    associated image
    """
    article = Article.objects.get(pk=id)
    body = json.loads(article.body)
    images = Images.objects.filter(article_id=id)
    material_obj = Materials.objects.get(article_id=id)

    materials = []
    for material in json.loads(material_obj.materials):
        materials.append(material)

    step_list = []
    for k, v in body.items():
        step_list.append([k, v])

    index = 0
    while index < len(images):
        step_list[index].append(images[index])
        index += 1

    comments = Comment.objects.filter(article_id=id)

    user_articles = Article.objects.filter(poster_id=request.user.id)
    article_ids = []
    for entry in user_articles:
        article_ids.append(entry.id)

    timestamp = article.timestamp.strftime("Posted on %m/%d/%Y, at %-I:%M %p")

    return render(request, "wiki/article.html", {
        "id": id,
        "article": article,
        "article_text": body,
        "comments": comments,
        "user_articles": article_ids,
        "images": images,
        "step_list": step_list,
        "materials": materials,
        "timestamp": timestamp
    })


@login_required
def post_comment(request, id):
    """Saves a comment to the database"""
    article = Article.objects.get(pk=id)
    if request.method == "POST":
        comment = request.POST["comment"]

        new_comment = Comment(
            article=article,
            poster=request.user,
            comment_text=comment
        )
        new_comment.save()

        return HttpResponseRedirect(reverse("article", args=(id,)))
    else:
        return render(request, "wiki/article.html")


@login_required
def save_reply(request, article_id, comment_id):
    """Saves a reply to a comment to the database"""
    comment = Comment.objects.get(pk=comment_id)
    if request.method == "POST":
        data = json.loads(request.body)
        reply = data["reply"]

        new_reply = Replies(
            comment=comment,
            reply=reply,
            timestamp=datetime.datetime.now().strftime("%m/%d/%Y, %H:%M"),
            poster=request.user
        )
        new_reply.save()

        return HttpResponseRedirect(reverse("article", args=(article_id,)))
    else:
        return render(request, "wiki/article.html")


def load_replies(request, id):
    """Loads the replies of a specified comment,
    3 at a time
    """
    start = int(request.GET.get("start")) - 1
    end = int(request.GET.get("end"))

    replies = Replies.objects.filter(comment_id=id).order_by('-timestamp')

    reply_list = []
    for item in replies[start:end]:
        reply_list.append(item.serialize())

    return JsonResponse(
        {
            "replies": reply_list
        },
        safe=False
    )


def get_article(request, id):
    """Sends information about a specified article
    to article.js to render like buttons
    """
    article = Article.objects.get(pk=id).serialize()
    if request.user.is_authenticated:
        user_likes = request.user.liked.all()
        likes_list = []
        for post in user_likes:
            likes_list.append(post.id)
    else:
        likes_list = None
    return JsonResponse(
        {
            "article": article,
            "user_likes": likes_list
        },
        safe=False
    )


def get_profile(request, id):
    """Sends information about a specified
    user profile to profile.js to render
    the follow button
    """
    current_user = request.user
    profile = User.objects.get(pk=id)
    serial_profile = profile.serialize()
    followers = profile.followers.all()
    follow_ids = []
    for profile in followers:
        follow_ids.append(profile.id)
    return JsonResponse({
        "follow_ids": follow_ids,
        "current_user_id": current_user.id,
        "current_profile": serial_profile
    },)


def get_comments(request, id):
    """Sends a list of comments in groups
    of ten to article.js to render those comments
    with infinite scroll
    """
    start = int(request.GET.get("start")) - 1
    end = int(request.GET.get("end"))

    comments = Comment.objects.filter(article_id=id).order_by('-timestamp')
    comments_serial = []
    for comment in comments[start:end]:
        comments_serial.append(comment.serialize())

    if request.user.is_authenticated:
        logged_in = True
    else:
        logged_in = False

    return JsonResponse(
        {
            "comments": comments_serial,
            "start": start,
            "end": end,
            "logged_in": logged_in
        },
        safe=False
    )


@login_required
def like_article(request, id):
    """Adds a user to the likes table"""
    article = Article.objects.get(pk=id)
    if request.method == "POST":
        article.likes.add(request.user)
        return HttpResponse(status=204)


@login_required
def unlike_article(request, id):
    """Removes a user from the likes table"""
    article = Article.objects.get(pk=id)
    if request.method == "POST":
        article.likes.remove(request.user)
        return HttpResponse(status=204)


def get_likes(request, id):
    """Retrieves the number of likes a given article has"""
    article = Article.objects.get(pk=id).serialize()
    likes = article["likes"]
    likes_num = json.loads(likes)

    return JsonResponse(len(likes_num), safe=False)


@login_required
def follow(request, id):
    """Adds a user to the following table"""
    user = User.objects.get(pk=id)
    request.user.following.add(user)
    return HttpResponse(status=204)


@login_required
def unfollow(request, id):
    """Removes a user from the following table"""
    user = User.objects.get(pk=id)
    request.user.following.remove(user)
    return HttpResponse(status=204)


def get_follows(request, id):
    """Retrieves the number of users
    following a specified user"""
    profile = User.objects.get(pk=id)
    followers = profile.followers.all()

    return JsonResponse(len(followers), safe=False)


def following(request):
    """Renders the page for a user to browse
    articles written by users they are following
    """
    return render(request, "wiki/following.html")


def get_following(request):
    """Retrieves a list of articles to be rendered
    on the following.html page in groups of ten
    with infinite scroll
    """
    start = int(request.GET.get("start")) - 1
    end = int(request.GET.get("end"))

    following_list = request.user.following.filter(followers=request.user.id)
    articles = Article.objects.filter(poster_id__in=following_list)

    article_list = []
    for item in articles[start:end]:
        article_list.append(item.serialize())

    return JsonResponse(
        {
            "articles": article_list
        },
        safe=False
    )


def delete_article(request, id):
    """Deletes an article from the database"""
    article = Article.objects.get(pk=id)
    article.delete()

    return HttpResponseRedirect(reverse("profile", args=(article.poster.id,)))


def get_all_articles(request):
    """Retrieves and returns a list of all articles
    posted by users the current user is following
    """
    start = int(request.GET.get("start")) - 1
    end = int(request.GET.get("end"))
    articles = Article.objects.all()

    article_list = []
    for item in articles[start:end]:
        article_list.append(item.serialize())

    max_reached = False
    if len(article_list) == 0:
        max_reached = True

    return JsonResponse({
        "start": start,
        "end": end,
        "articles": article_list,
        "max_reached": max_reached
    }, safe=False)
