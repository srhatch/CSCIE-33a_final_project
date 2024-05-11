from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core import serializers


class User(AbstractUser):
    """Defines the user table.
    A field is given for users who follow a given user.
    Articles a user likes are serialized here as well.
    """
    following = models.ManyToManyField(
        "User",
        related_name="followers"
    )

    def __str__(self):
        return self.username

    def serialize(self):
        return {
            "liked": serializers.serialize("json", self.liked.all()),
            "id": self.id,
            "password": self.password,
            "last_login": self.last_login,
            "is_superuser": self.is_superuser,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_staff": self.is_staff,
            "is_active": self.is_active,
            "date_joined": self.date_joined,
            "followers": serializers.serialize("json", self.followers.all())
        }


class Article(models.Model):
    """Defines an article table. Fields are given for the title,
    text content of each step, the user who posted the article
    (via foreign key), and a time-stamp. A ManyToMany relationship
    is defined here for the likes an article has.
    """
    title = models.CharField(max_length=50)
    body = models.CharField(max_length=2000)
    poster = models.ForeignKey(
        User,
        related_name="post",
        on_delete=models.CASCADE
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="liked")
    thumbnail = models.ImageField(null=True, blank=True, upload_to="images/")

    def __str__(self):
        return self.title

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "poster": self.poster.username,
            "timestamp": self.timestamp,
            "likes": serializers.serialize("json", self.likes.all()),
            "thumbnail": str(self.thumbnail)
        }


class Materials(models.Model):
    """Defines the materials given in an article.
    Each entry is linked to an article via foreign key.
    """
    article = models.ForeignKey(
        Article,
        related_name="req_materials",
        on_delete=models.CASCADE
    )
    materials = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    def __str__(self):
        return str(self.id)


class Comment(models.Model):
    """Defines the comments table.
    A comment is associated with an article and a user.
    Fields are given for the text content and timestamp.
    """
    article = models.ForeignKey(
        Article,
        related_name="comments",
        on_delete=models.CASCADE
    )
    poster = models.ForeignKey(
        User,
        related_name="comment",
        on_delete=models.CASCADE
    )
    comment_text = models.CharField(max_length=5000)
    timestamp = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return str(self.id)

    def serialize(self):
        return {
            "id": self.id,
            "article": self.article.id,
            "poster": self.poster.username,
            "comment_text": self.comment_text,
            "timestamp": self.timestamp,
            "replies": serializers.serialize("json", self.reply_list.all())
        }


class Images(models.Model):
    """Defines the images table.
    An imageField stores the url to the image file.
    """
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    images = models.ImageField(null=True, blank=True, upload_to="images/")

    def __str__(self):
        return str(self.id)


class Replies(models.Model):
    """Defines the replies table.
    Each reply is associated with a comment and a user.
    """
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="reply_list"
    )
    reply = models.CharField(max_length=5000)
    poster = models.ForeignKey(User, on_delete=models.CASCADE, default=0)
    timestamp = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return str(self.id)

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.poster.username,
            "poster_id": self.poster.id,
            "comment": self.comment.id,
            "reply": self.reply,
            "timestamp": self.timestamp
        }
