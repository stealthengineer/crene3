# from allauth.account.adapter import DefaultAccountAdapter
# from django.urls import reverse
# from django.shortcuts import redirect

# class CustomAccountAdapter(DefaultAccountAdapter):
#     def add_message(self, request, level, message_template, message_context={}, **kwargs):
#         if message_template == "/accounts/social/signup/":
#             # Customize the error message if needed
#             message = "yooooooooooooooooo account already exists with this email address. Please sign in to that account first, then connect your %s account."
#             super().add_message(request, level, message, message_context, **kwargs)
#             # Redirect to the root URL
#             return redirect('/')
#         else:
#             return super().add_message(request, level, message_template, message_context, **kwargs)



from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from allauth.socialaccount.signals import pre_social_login
from allauth.account.utils import perform_login
from allauth.utils import get_user_model
from django.http import HttpResponse
from django.dispatch import receiver
from django.shortcuts import redirect
from django.conf import settings
import json


class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    '''
    Overrides allauth.socialaccount.adapter.DefaultSocialAccountAdapter.pre_social_login to 
    perform some actions right after successful login
    '''
    def pre_social_login(self, request, sociallogin):
        pass    # TODOFuture: To perform some actions right after successful login

@receiver(pre_social_login)
def link_to_local_user(sender, request, sociallogin, **kwargs):
    ''' Login and redirect
    This is done in order to tackle the situation where user's email retrieved
    from one provider is different from already existing email in the database
    (e.g facebook and google both use same email-id). Specifically, this is done to
    tackle following issues:
    * https://github.com/pennersr/django-allauth/issues/215

    '''
    if sociallogin.account.extra_data.get("email"):
        email_address = sociallogin.account.extra_data['email']
        User = get_user_model()
        users = User.objects.filter(email=email_address)
        if users:
            # allauth.account.app_settings.EmailVerificationMethod
            perform_login(request, users[0], email_verification='optional')
            raise ImmediateHttpResponse(redirect(settings.LOGIN_REDIRECT_URL.format(id=request.user.id)))
