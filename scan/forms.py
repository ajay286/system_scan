# -*- coding: utf-8 -*-

from system_scan.scan.models import *

import json

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.forms import CharField, CheckboxSelectMultiple, Form, ModelForm, TextInput

class ContestForm(ModelForm):
	class Meta:
		model = Contest
		fields = ('name', 'start', 'end')

	def clean(self):
		cleaned_data = super(ContestForm, self).clean()
		start = cleaned_data.get('start')
		end = cleaned_data.get('end')

		if start < datetime.datetime.now():
			self._errors['start'] = self.error_class(['開始日時を現在時刻より前に設定することはできません。'])
			del cleaned_data['start']
		if end < start:
			self._errors['end'] = self.error_class(['終了日時を開始日時より前に設定することはできません。'])
			del cleaned_data['end']

		return cleaned_data

class ContestGenreForm(ModelForm):
	class Meta:
		model = Contest
		fields = ('genres',)

	def __init__(self, *args, **kwargs):
		super(ContestGenreForm, self).__init__(*args, **kwargs)
		self.fields['genres'].help_text = ''
		self.fields['genres'].widget = CheckboxSelectMultiple()
		self.fields['genres'].queryset = Genre.objects.all()

class ContestUserForm(Form):
	user = CharField(label = 'ユーザー名')

	def __init__(self, contest, *args, **kwargs):
		self.contest = contest
		super(ContestUserForm, self).__init__(*args, **kwargs)

		html_id = self.auto_id % ('user')
		choices = [user.username for user in User.objects.exclude(id__in = contest.users.values_list('id', flat = True))]

		self.fields['user'].help_text = '<script>$(\'#%s\').autocomplete({source:%s});</script>' % (html_id, json.dumps(choices))

	def clean(self):
		cleaned_data = super(ContestUserForm, self).clean()
		user = cleaned_data.get('user')

		if not user or not User.objects.filter(username = user):
			self._errors['user'] = self.error_class(['存在しないユーザーです。'])
			del cleaned_data['user']
		elif User.objects.get(username = user) in self.contest.users.all():
			self._errors['user'] = self.error_class(['ユーザーはすでに追加されています。'])
			del cleaned_data['user']

		return cleaned_data
