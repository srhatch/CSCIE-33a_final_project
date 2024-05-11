This was my final project for CSCIE-33a (Web Development with Python and Javascript). The class
was essentially about how to use the Django framework with front end Javascript. This project
was a capstone on the general MVC architecture and the various features used in Django
throughout the semester (models, URL routing, Django forms, Django HTML templating,
and sqlite database to name a few). This project is an app that can be used to post articles
on dog training. An author can dynamically add or remove steps, each including an optional
image, and can similarly add or remove and materials needed. The app has basic user profile-type
functionality including liking articles, following users, commenting on articles, and replying to
comments. I left some test data in the database.

To run dev server, python is required (at the time this was written python was @ v3.10.7):
Navigate to the main directory (finalrepo/wikiwoof) and run command python manage.py runserver