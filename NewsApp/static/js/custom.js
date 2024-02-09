function send_reaction(reaction,news_id){
    console.log("This is reaction function")
    $.ajax({
        url: '/reaction/',
        type: 'POST',
        data: {
            'news_id': news_id,
            'text': reaction
        },
        success: function(response) {
            var response = JSON.parse(response)
            if (response.alert){
                var notification = `<div class="alert alert-danger" role="alert">
                <i class='fas fa-exclamation-circle'></i>
                Please login to your account to react 
                </div>`
                    $('#notification_shown').html(notification)
                    var notification_div=document.getElementById('notification_shown')
                    notification_div.style.display = 'block';
                    setTimeout(delayedFunction, 3000);
            }
            else{

                let reaction_count = Number($(`#reaction_count${news_id}`).text())
                if (response.Created){
                    reaction_count += 1 
                }

                var reaction_updated_html=`
                <i class="fa-regular fa-face-smile"></i> 
                <i class="fa-regular ${reaction} " onclick="delete_reaction('${news_id}')"></i>
                <span class="fw-500" id="reaction_count${news_id}">${reaction_count}</span>
                `
                $(`#reaction_tag${news_id}`).html(reaction_updated_html)
            }

        },
        error: function(error) {
            console.log(error)
            alert("There is some issue in network please try again")
        }
    });
}


function send_comment(){
    console.log("This is reaction function")
    let news_id = $('#comment_news_id').val()
    let comment = $('#comment_input_value').val()
    $.ajax({
        url: '/comments/',
        type: 'POST',
        data: {
            'news_id': news_id,
            'text': comment
        },
        success: function(response) {
            var response = JSON.parse(response)
            if (response.alert){
                var notification = `<div class="alert alert-danger" role="alert">
                <i class='fas fa-exclamation-circle'></i>
                Please login to your account for comment
                </div>`
                    $('#notification_shown').html(notification)
                    var notification_div=document.getElementById('notification_shown')
                    notification_div.style.display = 'block';
                    setTimeout(delayedFunction, 3000);
            }
            else{
            var insert_comment = `
            <div class="comment " id="comment_${response.commentid}">
               <div class="comment-header">
                  <h4>${response.username}</h4>
                  <p>
                     Just Now
                  </p>
               </div>
               <p class="discription">${comment}</p>
            
            <div class="avatar-wrap reply_comment">
                <div class="votes_wrap mtop10">
                            <div class="img_votes">
                                <a href="javascript:void(0)" onclick = "vote_fun(true,${response.commentid})" id = "vote_${response.commentid}">
                                    <svg rpl="" fill="currentColor" height="16" icon-name="upvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8ZM2.227 9.784l-.012.016c.01-.006.014-.01.012-.016Z"></path><!--?--> </svg>
                                </a>
                                <p id='vote_count_${response.commentid}'>0</p>
                                
                                <a href="javascript:void(0)" onclick = "vote_fun(false,${response.commentid})" id = "devote_${response.commentid}">
                                    <svg rpl="" fill="currentColor" height="16" icon-name="downvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Zm15.469-.05c-.01 0-.014.007-.012.013l.012-.013Z"></path><!--?--> </svg>
                                </a>
                            </div>

                            <div class="img_votes">
                                <a href="javascript:void(0)" onclick="add_sub_comments(${response.commentid})">
                                <svg rpl="" aria-hidden="true" class="icon-comment" fill="currentColor" height="20" icon-name="comment-outline" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"> <!--?lit$423737984$--><!--?lit$423737984$--><path d="M7.725 19.872a.718.718 0 0 1-.607-.328.725.725 0 0 1-.118-.397V16H3.625A2.63 2.63 0 0 1 1 13.375v-9.75A2.629 2.629 0 0 1 3.625 1h12.75A2.63 2.63 0 0 1 19 3.625v9.75A2.63 2.63 0 0 1 16.375 16h-4.161l-4 3.681a.725.725 0 0 1-.489.191ZM3.625 2.25A1.377 1.377 0 0 0 2.25 3.625v9.75a1.377 1.377 0 0 0 1.375 1.375h4a.625.625 0 0 1 .625.625v2.575l3.3-3.035a.628.628 0 0 1 .424-.165h4.4a1.377 1.377 0 0 0 1.375-1.375v-9.75a1.377 1.377 0 0 0-1.374-1.375H3.625Z"></path><!--?--> </svg>
                                <p id="subcomment_count_${response.commentid}">0</p>
                            </a>
                            </div>
                            <div class="img_votes">
                            <a href="javascript:void(0)" onclick = "set_subcomment_input(${response.commentid})">reply</a>
                            </div>
                    </div>
                </div>
                </div>
            `
            if ($('#main_comments_div #see-more').length > 0) {
                $('#main_comments_div #see-more').before(insert_comment);
            } else {
                $('#main_comments_div').append(insert_comment);
            }
        $('#comment_input_value').val('')
        $(`#comnt_count${news_id}`).text(response.comment_count)
        }
        },
        error: function(error) {
            alert("There is some issue in network please try again")
        }
    });
}


function delete_reaction(news_id){
    $.ajax({
        url: '/reaction/',
        type: 'PUT',
        data: {
            'news_id': news_id
        },
        success: function(response) {
            var response = JSON.parse(response)
            let reaction_count = Number($(`#reaction_count${news_id}`).text())-1

                var reaction_updated_html=`
                <i class="fa-regular fa-face-smile"></i>
                <span class="fw-500" id="reaction_count${news_id}">${reaction_count}</span>
                `
                $(`#reaction_tag${news_id}`).html(reaction_updated_html)
        },
        error: function(error) {
            console.log('error')
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("passwordInput");
    const eyeIcon = document.getElementById("eyeIcon");
  
    eyeIcon.addEventListener("click", function () {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
      } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
      }
    });
  });

  
document.querySelector('.copy-icon').addEventListener('click', function() {
    var textToCopy = this.getAttribute('data-copy-text');

    var inputElement = document.createElement('input');
    inputElement.setAttribute('value', textToCopy);
    document.body.appendChild(inputElement);

    inputElement.select();
    document.execCommand('copy');

    document.body.removeChild(inputElement);
});


function toggleOverlay(news_id) {
    add_comments(news_id)
    document.getElementById("commentOverlay").style.display = "block";
    document.body.style.overflow = 'hidden';
    document.getElementById("overlay").style.zIndex = 9;
    document.getElementById("overlay").style.backgroundColor = 'rgba(0,0,0,0.7)';
    document.getElementById("overlay").style.visibility = 'visible';
    document.getElementById("overlay").style.opacity = 1;
    
}

function off() {
    document.getElementById("commentOverlay").style.display = "none";
    document.getElementById("menuNavigation").style.display = "none";
    document.body.style.overflow = 'auto';
    document.getElementById("overlay").style.zIndex = 0;
    document.getElementById("overlay").style.backgroundColor = '#fff';
    document.getElementById("overlay").style.visibility = 'hidden';
    document.getElementById("overlay").style.opacity = 0;
  }


function add_comments(news_id,page_no=1){
    console.log("This is add comments",news_id)
    if (page_no==1){
        $('#main_comments_div').html('')
    }
    $('#see-more').remove()
    $('#comment_news_id').val(news_id)
    var title = $(`#title${news_id}`).text()
    $('#comnts_heading').text(title)
    page_no = parseInt(page_no)
    $.ajax({
        url: '/comments/',
        type: 'Get',
        data: {
            'news_id': news_id,
            'page_no':page_no
        },
        success: function(response) {
            var response = JSON.parse(response)
            if(response.alert){
                alert("Can't find page no")
                location.reload()
            }
            comments_info = response.comments_list
            console.log(comments_info)
            let insert_comment  = ''
            for (let i=0;i<comments_info.length;i++){
                let favour_color = 'currentColor'
                let unfavour_color = 'currentColor'
                if (comments_info[i].in_favour == true){
                    favour_color = 'blue'
                }
                else if (comments_info[i].in_favour == false & typeof comments_info[i].in_favour == "boolean"){
                    unfavour_color = 'red'
                }
                let vote = sub_cmnt_count = 0
                if (comments_info[i].difference){
                    vote = comments_info[i].difference
                }
                if (comments_info[i].sub_cmnt_count){
                    sub_cmnt_count = comments_info[i].sub_cmnt_count
                }
            insert_comment += `
            <div class="comment " id="comment_${comments_info[i].id}">
               <div class="comment-header">
                  <h4>${comments_info[i].usernames}</h4>
                  <p>
                     ${get_time(comments_info[i].cmnt_time)}
                  </p>
               </div>
               <p class="discription">${comments_info[i].comments}</p>
               <div class="avatar-wrap reply_comment">
                <div class="votes_wrap mtop10">
                            <div class="img_votes">
                                <a href="javascript:void(0)" onclick = "vote_fun(true,${comments_info[i].id})" id = "vote_${comments_info[i].id}">
                                    <svg rpl="" fill="${favour_color}" height="16" icon-name="upvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8ZM2.227 9.784l-.012.016c.01-.006.014-.01.012-.016Z"></path><!--?--> </svg>
                                </a>
                                <p id='vote_count_${comments_info[i].id}'>${vote}</p>
                                
                                <a href="javascript:void(0)" onclick = "vote_fun(false,${comments_info[i].id})" id = "devote_${comments_info[i].id}">
                                    <svg rpl="" fill="${unfavour_color}" height="16" icon-name="downvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Zm15.469-.05c-.01 0-.014.007-.012.013l.012-.013Z"></path><!--?--> </svg>
                                </a>
                            </div>

                            <div class="img_votes">
                                <a href="javascript:void(0)" onclick="add_sub_comments(${comments_info[i].id})">
                                <svg rpl="" aria-hidden="true" class="icon-comment" fill="currentColor" height="20" icon-name="comment-outline" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"> <!--?lit$423737984$--><!--?lit$423737984$--><path d="M7.725 19.872a.718.718 0 0 1-.607-.328.725.725 0 0 1-.118-.397V16H3.625A2.63 2.63 0 0 1 1 13.375v-9.75A2.629 2.629 0 0 1 3.625 1h12.75A2.63 2.63 0 0 1 19 3.625v9.75A2.63 2.63 0 0 1 16.375 16h-4.161l-4 3.681a.725.725 0 0 1-.489.191ZM3.625 2.25A1.377 1.377 0 0 0 2.25 3.625v9.75a1.377 1.377 0 0 0 1.375 1.375h4a.625.625 0 0 1 .625.625v2.575l3.3-3.035a.628.628 0 0 1 .424-.165h4.4a1.377 1.377 0 0 0 1.375-1.375v-9.75a1.377 1.377 0 0 0-1.374-1.375H3.625Z"></path><!--?--> </svg>
                                <p id="subcomment_count_${comments_info[i].id}">${sub_cmnt_count}</p>
                            </a>
                            </div>
                            <div class="img_votes">
                            <a href="javascript:void(0)" onclick = "set_subcomment_input(${comments_info[i].id})">reply</a>
                            </div>
                    </div>
                    </div>
            </div>
            `
            }
            if(comments_info.length >=10){
                insert_comment += `<p id='see-more' onclick="add_comments('${news_id}',${page_no+1})")>See More</p>`
            }
            if (page_no == 1){
            $('#main_comments_div').html(insert_comment)
            }
            else{
                $('#main_comments_div').append(insert_comment)
            }

        },
        error: function(error) {
            if (window.confirm('Please login to your account'))
            {
                window.location.replace("/signup/");
            }
        }
    });
}


function get_time(timestamp){
    var givenTime = new Date(timestamp);
    var currentTime = new Date();
    var timeDifference = currentTime - givenTime;
    if (timeDifference<1000){
        return "Just now"
    }
    else if (timeDifference<3600000){
        return `${parseInt(timeDifference/60000)} min ago`
    }
    else if (timeDifference<86400000){
        return `${parseInt(timeDifference/3600000)} hour ago`
    }
    else {
        return `${parseInt(timeDifference/86400000)} day ago`
    }
}


function news_search(){
    query = $('#news_search_bar').val()
    window.location.replace(`/search/?q=${query}`);
}

function textcopied(url) {
    let host=window.location.hostname
    navigator.clipboard.writeText(host+url);
    var notification = `<div class="alert alert-success" role="alert">
    <i class="fa fa-info-circle"></i>
    Link is copied
  </div>`
    $('#notification_shown').html(notification)
    var notification_div=document.getElementById('notification_shown')
    notification_div.style.display = 'block';
    setTimeout(delayedFunction, 3000);

  }

  function delayedFunction() {
    var myDiv = document.getElementById('notification_shown');
    if (myDiv) {
      myDiv.style.display = 'none';
    }
  }


  function toggleMenu() {
    document.getElementById("menuNavigation").style.display = "flex";
    document.body.style.overflow = 'hidden';
    document.getElementById("overlay").style.zIndex = 9;
    document.getElementById("overlay").style.backgroundColor = 'rgba(0,0,0,0.7)';
    document.getElementById("overlay").style.visibility = 'visible';
    document.getElementById("overlay").style.opacity = 1;
}

function showSearch() {
    var searchBar = document.getElementById("searchBar");
    var mainHeading =  document.getElementById("mainHeading");
    searchBar.style.display === "block" ? searchBar.style.display = "none" : searchBar.style.display = "block";
    searchBar.style.display === "block" ? mainHeading.style.marginTop = "40px" : mainHeading.style.marginTop = "10px";
}


function filter_date(days){
    let currentDate = new Date()
    let yesterday = new Date(currentDate)
    yesterday.setDate(yesterday.getDate() - 30)
    window.location.replace("")
}


function vote_fun(vote,comment){
    console.log('This is working',vote,comment)
    $.ajax({
        url: '/voting/',
        type: 'POST',
        data: {
            'vote': vote,
            'comment': comment
        },
        success: function(response) {
            var response = JSON.parse(response)
            if (response.msg){
                if (vote){
                    var fillValue = $('#vote_' + comment + ' svg').attr('fill');
                    if (fillValue == 'blue'){
                        $('#vote_' + comment + ' svg').attr('fill','currentColor');
                        let new_count = parseInt($('#vote_count_'+comment).text())-1;
                        console.log(new_count,'newcount')
                        $('#vote_count_'+comment).html(new_count.toString())
                    }
                    else{
                        $('#vote_' + comment + ' svg').attr('fill','blue');
                        $('#devote_' + comment + ' svg').attr('fill','currentColor');
                        if (response.msg == 'UPDATE'){
                            console.log($('#vote_count_'+comment).text())
                            let new_count = parseInt($('#vote_count_'+comment).text())+2;
                            $('#vote_count_'+comment).html(new_count.toString())
                            }
                        else{
                            let new_count = parseInt($('#vote_count_'+comment).text())+1;
                            $('#vote_count_'+comment).html(new_count.toString())
                        }
                    }
                    $('#devote_' + comment + ' svg').attr('fill','currentColor');
                }
                else{
                    var fillValue = $('#devote_' + comment + ' svg').attr('fill');
                    if(fillValue == 'red'){
                        $('#devote_' + comment + ' svg').attr('fill','currentColor');
                        let new_count = parseInt($('#vote_count_'+comment).text())+1;
                        $('#vote_count_'+comment).html(new_count.toString())
                    }
                    else{
                        $('#devote_' + comment + ' svg').attr('fill','red');
                        $('#vote_' + comment + ' svg').attr('fill','currentColor');
                        if (response.msg == 'UPDATE'){
                            console.log($('#vote_count_'+comment).text())
                            let new_count = parseInt($('#vote_count_'+comment).text())-2;
                            $('#vote_count_'+comment).html(new_count.toString())
                            }
                        else{
                            let new_count = parseInt($('#vote_count_'+comment).text())-1;
                            $('#vote_count_'+comment).html(new_count.toString())
                        }
                    }
                }
            }
        },
        error: function(error) {
            console.log(error)
        }
    });

}
function boldComments(text) {
    if (text.includes('@')){
        var atIndex = text.indexOf(' ');
        var username = text.substring(0, atIndex); 
        if (username.includes('@')){
            var text = text.substring(atIndex + 1);
            
            return '<strong><i>'+username.substring(1)+'</i></strong>'+' '+text
        }
    }
    return text
}


function add_sub_comments(comment){
    if(! $('#sub_comment_of_'+comment).length){
    $.ajax({
        url: '/subcomment/',
        type: 'GET',
        data: {
            'parent_comment':comment
        },
        success: function(response) {
            var response = JSON.parse(response)
            let subcomments = response.sub_comments
            let temp = ''
            for(let i=0;i<subcomments.length;i++){
                let favour_color = 'currentColor'
                let unfavour_color = 'currentColor'
                if (subcomments[i].in_favour == true){
                    favour_color = 'blue'
                }
                else if (subcomments[i].in_favour == false & typeof subcomments[i].in_favour == "boolean"){
                    unfavour_color = 'red'
                }
                let vote = 0
                if (subcomments[i].difference){
                    vote = subcomments[i].difference
                }
                temp = temp + `
                    <div class="avatar-wrap reply_comment" id = "sub_comment_of_${comment}">                                               
                        <div class="parennt_comment_col">                        
                            <div class="comment-header">
                                <h6>${subcomments[i].usernames}</h6>
                                <p1>${get_time(subcomments[i].cmnt_time)}</p1>
                            </div>
                            <div class="parent_mid_col">
                                <p>${boldComments(subcomments[i].comments)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="votes_wrap mtop10">
                           <div class="img_votes parent_mid_col">
                                <a href="javascript:void(0)" onclick = "vote_fun(true,${subcomments[i].id})" id = "vote_${subcomments[i].id}">
                                    <svg rpl="" fill="${favour_color}" height="16" icon-name="upvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8ZM2.227 9.784l-.012.016c.01-.006.014-.01.012-.016Z"></path><!--?--> </svg>
                                </a>
                                <p id='vote_count_${subcomments[i].id}'>${vote}</p>
                                
                                <a href="javascript:void(0)" onclick = "vote_fun(false,${subcomments[i].id})" id = "devote_${subcomments[i].id}">
                                    <svg rpl="" fill="${unfavour_color}" height="16" icon-name="downvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Zm15.469-.05c-.01 0-.014.007-.012.013l.012-.013Z"></path><!--?--> </svg>
                                </a>
                            </div> 
                            <div class="img_votes">
                                <a href="javascript:void(0)" onclick = "set_subcomment_input(${comment},'${subcomments[i].usernames}')">reply</a>
                            </div>
                        </div>
                    `
                }
            $('#comment_'+comment).append(temp)
        },
        error: function(error) {
            console.log(error)
            alert("There is some issue in network please try again")
        }
    });
}
}


function set_subcomment_input(comment,reply_on=false){
    if (! $('#remove_subcomment_input').length){
        $("#comment_input_value").remove();
    $("#comment_input_div").prepend(`<a href="javascript:void(0)" style="position: relative;right: -97%;color: red;" onclick="remove_subcomment_input()" id="remove_subcomment_input">X</a> 
    <span id="reply_txt" style="margin-right: 10%;" >Reply...</span>
    <input placeholder="Write your comment here...." onchange="send_subcomment(${comment})" id="comment_input_value">`)
    if (reply_on){
        $("#comment_input_value").val('@'+reply_on+' ')
    }
    }
}


function remove_subcomment_input(){
    // $("#comment_input_value").attr("onchange", "send_comment()");
    $("#comment_input_value").remove()
    $("#comment_input_div").prepend(`
    <input placeholder="Write your comment here...." onchange="send_comment()" id="comment_input_value">
    `)
    $("#reply_txt").remove();
    $("#remove_subcomment_input").remove();
    $("#comment_input_value").val('')
}


function send_subcomment(comment){
    let news_id = $('#comment_news_id').val()
    let text = $('#comment_input_value').val()
    $.ajax({
        url: '/subcomment/',
        type: 'POST',
        data: {
            'news_id': news_id,
            'text': text,
            'parent_comment':comment
        },
        success: function(response) {
            var response = JSON.parse(response)
            if(response.alert){
                var notification = `<div class="alert alert-danger" role="alert">
                <i class='fas fa-exclamation-circle'></i>
                Please login for comment 
                </div>`
                    $('#notification_shown').html(notification)
                    var notification_div=document.getElementById('notification_shown')
                    notification_div.style.display = 'block';
                    setTimeout(delayedFunction, 3000);
            }
            else
            {
            $('#subcomment_count_'+comment).html(response.sub_cmnt_count)
            remove_subcomment_input()
            $('#comment_input_value').val('')
            if($('#sub_comment_of_'+comment).length){
            let newSubcomment = `
            <div class="avatar-wrap reply_comment " id="sub_comment_of_${comment}">                                               
            <div class="parennt_comment_col">                        
                    <div class="comment-header">
                        <h6>${response.username}</h6>
                        <p1>Just Now</p1>
                    </div>
                    <div class="parent_mid_col">
                        <p>${boldComments(text)}</p>
                    </div>
                </div>  
            </div>
            <div class="votes_wrap mtop10">
                <div class="img_votes parent_mid_col">
                    <a href="javascript:void(0)" onclick = "vote_fun(true,${response.sub_cmnt_id})" id = "vote_${response.sub_cmnt_id}">
                        <svg rpl="" fill="currentColor" height="16" icon-name="upvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166.368a1.128 1.128 0 0 1 1.668.004l7.872 8.581a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 1.31 2.258 9.75H7.25v8ZM2.227 9.784l-.012.016c.01-.006.014-.01.012-.016Z"></path><!--?--> </svg>
                    </a>
                    <p id='vote_count_${response.sub_cmnt_id}'>0</p>
                    
                    <a href="javascript:void(0)" onclick = "vote_fun(false,${response.sub_cmnt_id})" id = "devote_${response.sub_cmnt_id}">
                        <svg rpl="" fill="currentColor" height="16" icon-name="downvote-outline" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"> <!--?lit$7319853$--><!--?lit$7319853$--><path d="M10 20a1.122 1.122 0 0 1-.834-.372l-7.872-8.581A1.251 1.251 0 0 1 1.118 9.7 1.114 1.114 0 0 1 2.123 9H6V2.123A1.125 1.125 0 0 1 7.123 1h5.754A1.125 1.125 0 0 1 14 2.123V9h3.874a1.114 1.114 0 0 1 1.007.7 1.25 1.25 0 0 1-.171 1.345l-7.876 8.589A1.128 1.128 0 0 1 10 20Zm-7.684-9.75L10 18.69l7.741-8.44H12.75v-8h-5.5v8H2.316Zm15.469-.05c-.01 0-.014.007-.012.013l.012-.013Z"></path><!--?--> </svg>
                    </a>
                </div> 
                <div class="img_votes">
                    <a href="javascript:void(0)" onclick = "set_subcomment_input(${comment},'${response.username}')">reply</a>
                </div>
            </div>
            `;
            $('#comment_'+comment).append(newSubcomment)
            }
        }
        },
        error: function(error) {
            console.log(error)
            alert("There is some issue in network please try again")
        }
    });
}