from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("get_all_articles", views.get_all_articles, name="get_all_articles"),
    path("login", views.login_view, name="login"),
    path("register", views.register, name="register"),
    path("logout", views.logout_view, name="logout"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("new_article", views.new_article, name="new_article"),
    path("save_article", views.save_article, name="save_article"),
    path("article/<int:id>", views.article_view, name="article"),
    path("post_comment/<int:id>", views.post_comment, name="post_comment"),
    path(
        "save_reply/<int:article_id>/<int:comment_id>",
        views.save_reply,
        name="post_reply"
    ),
    path("get_article/<int:id>", views.get_article, name="get_article"),
    path("like_article/<int:id>", views.like_article, name="like_article"),
    path(
        "unlike_article/<int:id>",
        views.unlike_article,
        name="unlike_article"
    ),
    path("get_likes/<int:id>", views.get_likes, name="get_likes"),
    path("follow/<int:id>", views.follow, name="follow"),
    path("unfollow/<int:id>", views.unfollow, name="unfollow"),
    path("get_profile/<int:id>", views.get_profile, name="get_profile"),
    path(
        "profile/get_follows/<int:id>",
        views.get_follows,
        name="get_follows"
    ),
    path(
        "profile/<int:id>/get_articles",
        views.get_articles,
        name="get_posts"
    ),
    path(
        "article/<int:id>/get_comments",
        views.get_comments,
        name="get_comments"
    ),
    path("load_replies/<int:id>", views.load_replies, name="load_replies"),
    path("following", views.following, name="following"),
    path("get_following", views.get_following, name="get_following"),
    path(
        "delete_article/<int:id>",
        views.delete_article,
        name="delete_article"
    )
]
