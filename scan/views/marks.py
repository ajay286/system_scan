# -*- coding: utf-8 -*-

import datetime

from scan.forms.marks import AnswerForm
from scan.models import Answer, Contest, Genre, Problem

from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render_to_response
from django.template import RequestContext

def check(request, contest_id, genre_id):
    contest = get_object_or_404(Contest, pk = contest_id)
    genre = get_object_or_404(Genre, pk = genre_id)
    if not request.user in contest.users.all():
        return redirect('scan.views.contests.index', contest_id)
    if not datetime.datetime.now() > contest.end:
        return redirect('scan.views.contests.index', contest_id)
    return contest, genre

@login_required
def index(request, contest_id, genre_id):
    result = check(request, contest_id, genre_id)
    if not isinstance(result, tuple):
        return result
    contest, genre = result

    problems = Problem.objects.filter(contest = contest, genre = genre).order_by('id')
    answers = Answer.objects.filter(problem__in = problems)

    array = {}
    for answer in answers:
        if not answer.problem.id in array:
            array[answer.problem.id] = True
        if answer.point == None:
            array[answer.problem.id] = False
    marked = [k for k, v in array.items() if v]

    context = {'contest': contest, 'genre': genre, 'marked': marked, 'problems': problems}
    return render_to_response('marks/index.html', context, RequestContext(request))

@login_required
def problem(request, contest_id, genre_id, problem_id):
    return redirect('scan.views.index')