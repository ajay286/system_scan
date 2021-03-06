# -*- coding: utf-8 -*-

import json

from scan.models import Problem, Figure, Comment

from django.forms import Form, CharField, CheckboxSelectMultiple, ModelForm, ChoiceField, ModelChoiceField, RadioSelect, TextInput, Textarea, IntegerField, ImageField, FileField
from django.utils.translation import ugettext_lazy as _

problem_types = (
    _(u'ラジオボタン'),
    _(u'チェックボックス'),
    _(u'テキスト'),
    _(u'テキストエリア'),
)

class ProblemEditForm(ModelForm):
    type = ChoiceField(label = _(u'タイプ'), choices = [(i, problem_types[i]) for i in range(len(problem_types))], widget = RadioSelect)
    title = CharField(label = _(u'タイトル'), widget = TextInput)
    statement = CharField(label = _(u'問題文'), widget = Textarea)
    option = CharField(label = _(u'オプション'), widget = Textarea, required = False)
    result = CharField(label = _(u'正解'), widget = Textarea)
    point = IntegerField(label = _(u'配点'))

    class Meta:
        model = Problem
        fields = ('title', 'statement', 'point', 'type', 'option', 'result')

class UploadProblemForm(Form):
    file = FileField()

class FigureAddForm(ModelForm):
    graphics = ImageField(label = _(u'画像'))
    caption = CharField(label = _(u'見出し'), widget = TextInput)

    class Meta:
        model = Figure
        fields = ('graphics', 'caption')

class ProblemDeleteForm(ModelForm):
    class Meta:
        model = Problem
        fields = ()

class CommentForm(ModelForm):
    body = CharField(widget = Textarea)

    class Meta:
        model = Comment
        fields = ('body',)
