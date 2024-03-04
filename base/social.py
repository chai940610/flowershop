from 
def cleanup_social_account(backend, uid, user=None, *args, **kwargs):
# """
# 3rd party: python-social-auth.

# Social auth pipeline to cleanup the user's data.  Must be placed
# after 'social_core.pipeline.user.create_user'.
# """

# Check if the user object exists and a new account was just created.
if user and kwargs.get('is_new', False):

    *** THIS IS UNTESTED, BUT FACEBOOK'S DATA SHOULD COME INTO THE DETAILS KWARG ***
    user.first_name = kwargs['details']['first_name']
    user.last_name = kwargs['details']['last_name']
    user.save()

return {'user': user}