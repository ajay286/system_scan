from django import template
import urllib, hashlib, sys

register = template.Library()

class GravatarUrlNode(template.Node):
    def __init__(self, email, size = 40):
        self.email = template.Variable(email)
        self.size = size

    def render(self, context):
        try:
            email = self.email.resolve(context)
        except template.VariableDoesNotExist:
            return ''
        default = "identicon"
        size = self.size
        if context['request'].is_secure:
            gravatar_url = "https://secure.gravatar.com/"
        else:
            gravatar_url = "http://www.gravatar.com/"
        gravatar_url += "avatar/" + hashlib.md5(email.lower().encode('ascii')).hexdigest() + "?"
        if sys.version_info < (3, 0):
            gravatar_url += urllib.urlencode({'d':default, 's':str(size)}).replace('&', '&#38;')
        else:
            gravatar_url += urllib.parse.urlencode({'d':default, 's':str(size)}).replace('&', '&#38;')
        return gravatar_url

@register.tag
def gravatar_url(parser, token):
    try:
        tag_name, email = token.split_contents()

    except ValueError:
        raise template.TemplateSyntaxError("%r tag requires a single argument" % token.contents.split()[0])

    return GravatarUrlNode(email)

@register.tag
def big_gravatar_url(parser, token):
    try:
        tag_name, email = token.split_contents()

    except ValueError:
        raise template.TemplateSyntaxError("%r tag requires a single argument" % token.contents.split()[0])

    return GravatarUrlNode(email, 300)

@register.tag
def middle_gravatar_url(parser, token):
    try:
        tag_name, email = token.split_contents()

    except ValueError:
        raise template.TemplateSyntaxError("%r tag requires a single argument" % token.contents.split()[0])

    return GravatarUrlNode(email, 100)
