$(function(){
    $('#figure-manage').appendTo($('#id_statement').parent());
    $('#add-figure').dialog({
        autoOpen: false,
        title: $('#figure-manage>input').val(),
        closeOnEscape: false,
        modal: true,
    });
    $('#delete-figure').dialog({
        autoOpen: false,
        title: $('#delete-figure-button').val(),
        closeOnEscape: false,
        modal: true,
    });
    $('#add-figure').submit(function(event){
        event.preventDefault();
        $('#add-figure input[type="submit"]').prop('disabled', true);
        $.ajax({
            url:    $(this).attr('action'),
            type:   $(this).attr('method'),
            dataType: 'json',
            processData: false,
            contentType: false,
            data: new FormData($(this)[0]),
            success: function(data){
                $('#add-figure input[type="submit"]').prop('disabled', false);
                if(data.status=='success'){
                    reloadFigures();
                    closeAddFigureDialog();
                }else if(data.status=='error'){
                    alert('エラー');
                }else{
                    alert('不明なエラー');
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                $('#add-figure input[type="submit"]').prop('disabled', false);
                alert('エラー:'+textStatus);
            },
        });
    });
    $('input[name="type"]:radio').change(remakeAutoForm);
    $('#edit-problem').submit(function(){
        setOption();
        setFigureSequence();
        setResult();
    });
    remakeAutoForm();
    restoreForm();
    $('#figure-list').sortable({ cursor: "move", opacity: 0.5 });
    $('body').append($('<div>').attr({ id: 'figure-dialog' }));
});

function remakeAutoForm(){
    $('#autoform').remove();
    switch($('input[name="type"]:checked').val()){
        case '0': // RadioButton
            var elm = $('<div>').attr({id:'autoform'}).append($('<p>').text('選択肢:'))
                .append(generateChoiceTable('radio'))
                .append($('<p id="add-choice">').append($('<input>').attr({type:'button',value:'+',class:'btn btn-default',onclick:'addChoice(\'radio\')'})));
            break;
        case '1': // CheckBox
            var elm = $('<div>').attr({id:'autoform'}).append($('<p>').text('選択肢:'))
                .append(generateChoiceTable('checkbox'))
                .append($('<p id="add-choice">').append($('<input>').attr({type:'button',value:'+',class:'btn btn-default',onclick:'addChoice(\'checkbox\')'})));
            break;
        case '2': // Text
            var elm = $('<div>').attr({id:'autoform'}).append($('<p>').text('正解:'))
                .append($('<p>').append($('<input>').attr({type:'text'})));
            break;
        case '3': // Textarea
            var elm = $('<div>').attr({id:'autoform'}).append($('<p>').text('正解:'))
                .append($('<p>').append($('<textarea>').attr({rows:'5'})));
            break;
    }
    $('#action-buttons').before($(elm));
}

function generateChoiceTable(input_type){
    return $('<table>').attr({id:'choices'})
            .append($('<thead>').append($('<tr>').append($('<th>').text('番号')).append($('<th>').text('正解')).append($('<th>').text('選択肢')).append($('<th>').text('削除'))))
            .append($('<tbody>').append(generateChoiceRow(input_type,1)).append(generateChoiceRow(input_type,2)));
}

function generateChoiceRow(input_type, num){
    return $('<tr>')
            .append($('<td>').text('#'+num))
            .append($('<td>').append($('<input>').attr({type:input_type,name:input_type+'-result'})))
            .append($('<td>').append($('<textarea>').attr({tabindex:num,rows:1})))
            .append($('<td>').append($('<input>').attr({type:'button',value:'-',class:'btn btn-warning remove-choice',onclick:'removeChoice('+(num)+')'})));
}

function addChoice(input_type){
    var len = $('#choices>tbody').children().length;
    $('#choices>tbody').append(generateChoiceRow(input_type,len+1));
}

function removeChoice(num){
    $('#choices>tbody').children()[num-1].remove();
    renumber();
}

function renumber(){
    $('#choices>tbody>tr').each(function(i){
        $(this).children('td:first').text('#'+(i+1));
        $(this).find('input.remove-choice').attr('onclick','removeChoice('+(i+1)+')');
    });
}

function setOption(){
    switch($('input[name="type"]:checked').val()){
        case '0': // RadioButton
        case '1': // CheckBox
            var param = new Array();
            $('#choices textarea').each(function(){param.push($(this).val())});
            $('textarea[name="option"]').val(JSON.stringify(param));
            break;
    }
}

function setResult(){
    switch($('input[name="type"]:checked').val()){
        case '0': // RadioButton
            $('#choices input[type="radio"]').each(function(i){if($(this).is(':checked')){$('textarea[name="result"]').val(i)}});
            break;
        case '1': // CheckBox
            var param = new Array();
            $('#choices input[type="checkbox"]').each(function(i){if($(this).is(':checked')){param.push(i)}});
            $('textarea[name="result"]').val(JSON.stringify(param));
            break;
        case '2': // Text
            $('textarea[name="result"]').val($('#autoform input').val());
            break;
        case '3': // Textarea
            $('textarea[name="result"]').val($('#autoform textarea').val());
            break;
    }
}

function restoreForm(){
    restoreOption();
    restoreResult();
}

function restoreOption(){
    type = $('input[name="type"]:checked').val();
    if (type=='0'||type=='1'){
        var param = JSON.parse($('textarea[name="option"]').val())
        if (type=='0')
            adjustNumberOfOptions('radio',param.length);
        if (type=='1')
            adjustNumberOfOptions('checkbox',param.length);
        inputs = $('#choices textarea');
        for (var i = 0; i < param.length; i++){
            inputs.eq(i).val(param[i]);
        }
    }
}

function adjustNumberOfOptions(input_type,num){
    var len = $('#choices>tbody').children().length;
    if (len < num){
        for (var i = 0; i < num - len; i++){
            addChoice(input_type);
        }
    }else if(len > num){
        for (var i = 0; i < len - num; i++){
            removeChoice(0);
        }
    }
}

function restoreResult(){
    switch($('input[name="type"]:checked').val()){
        case '0': // RadioButton
            var pos = $('textarea[name="result"]').val();
            $('#choices input[type="radio"]').eq(pos).prop('checked', true);
            break;
        case '1': // CheckBox
            var param = JSON.parse($('textarea[name="result"]').val());
            for (var i = 0; i < param.length; i++){
                $('#choices input[type="checkbox"]').eq(parseInt(param[i])).prop('checked', true);
            }
            break;
        case '2': //Text
            $('#autoform input').val($('textarea[name="result"]').val());
            break;
        case '3': // Textarea
            $('#autoform textarea').val($('textarea[name="result"]').val());
            break;
    }
}

function openAddFigureDialog(){
    $('#add-figure').dialog('open');
}

function closeAddFigureDialog(){
    $('#add-figure').dialog('close');
}

function openDeleteFigureDialog(url){
    $('#delete-figure-button').attr('onclick', 'deleteFigure(\'' + url + '\')');
    $('#delete-figure').dialog('open');
}

function closeDeleteFigureDialog(){
    $('#delete-figure').dialog('close');
}

function deleteFigure(url){
    $.ajax({
        url: url,
        dataType: 'json',
        success: function(data){
            if(data.status=='success'){
                reloadFigures();
                closeDeleteFigureDialog();
            }
        }
    });
}

function reloadFigures(){
    var url = $('#figure-manage>a').attr('href');
    $.ajax({
        url: url,
        dataType: 'json',
        success: function(data){
            $('#figure-list').children().remove();
            for(var i = 0; i < data.length; i++){
                $('#figure-list').append(
                    $('<li>').append(
                        $('<figure>').append(
                            $('<img>').attr({
                                'class': 'figure-image',
                                src: data[i].url,
                                alt: data[i].caption
                            })
                        ).append(
                            $('<img>').attr({
                                'class': 'figure-expand',
                                src: STATIC_URL + 'img/expand.svg',
                                alt: '拡大ボタン',
                                onclock: 'showFigureDialog(this)'
                            })
                        ).append(
                            $('<figcaption>').text(data[i].caption)
                        ).append(
                            $('<input>').attr({
                                'class': 'btn btn-danger',
                                type: 'button',
                                onclick: 'openDeleteFigureDialog(\'' + data[i].delete + '\')',
                                value: '削除'
                            })
                        )
                    ).append(
                        $('<p>').attr({
                            'class': 'hidden'
                        }).text(data[i].id)
                    )
                )
            }
        }
    });
}

function saveAndPreview(){
    $('#edit-problem').append($('<input>').attr({type:'hidden',name:'preview',value:'true'}));
    $('#edit-problem').submit();
}

function setFigureSequence() {
    sequence = {}
    $('#figure-list li').each(function (i) {
        sequence[$(this).find('p').text()] = i + 1;
    });
    $('#edit-problem input[name="figure-sequence"]').val(JSON.stringify(sequence));
}

function showFigureDialog(t) {
    $('#figure-dialog').empty();
    $('#figure-dialog').append($('<img>').attr({ src: $(t).parent().find('.figure-image').attr('src'), alt: $(t).parent().find('figcaption').text() }));
    $('#figure-dialog').dialog({
        title: $(t).parent().find('figcaption').text(),
        closeOnEscape: true,
        modal: true,
        width: 'auto',
        height: 'auto',
    });
}
