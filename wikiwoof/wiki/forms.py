from django import forms


class Register(forms.Form):
    """Defines the form for a user to create a new account.
    Placeholders are used instead of labels.
    """
    email = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={"placeholder": "email"}),
        max_length=50
    )
    username = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={"placeholder": "Username"}),
        max_length=50
    )
    password = forms.CharField(
        label="",
        widget=forms.PasswordInput(attrs={"placeholder": "Password"}),
        max_length=50
    )
    confirmation = forms.CharField(
        label="",
        widget=forms.PasswordInput(attrs={"placeholder": "Re-enter password"}),
        max_length=50
    )


class Login(forms.Form):
    """Defines the form for a user to log in"""
    username = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={"placeholder": "Username"}),
        max_length=50
    )
    password = forms.CharField(
        label="",
        widget=forms.PasswordInput(attrs={"placeholder": "Password"}),
        max_length=50
    )
