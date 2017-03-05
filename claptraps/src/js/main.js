$(function () {
    topSearchFunc();    //头部固定导航栏搜索框隐藏显示
    showInfo();     //介绍显示全部与收起
    sortSongList();    //对歌曲清单按照播放量排序并添加序号与播放量统计条
    showGigPic();     //更新显示bang-gig演出信息照片墙
    prepareConNav();   //准备侧边栏con-nav导航功能
    rollBtn();        //底部滚动相似艺术家照片墙
   prepareAudio();
});

function topSearchFunc() {
    //头部固定导航栏搜索框隐藏显示
    var $searchInput = $("#top-search");
    $searchInput.hide();
    $(".top-nav-search").mouseover(function () {
        $searchInput.show();
    }).mouseout(function () {
        if (!$searchInput.val()){
            $searchInput.hide()
        }
    });
}
function showInfo() {
    //介绍显示全部
    var $message=$(".band-info p");
    var $btn=$(".band-info a");
    var fullmes=$message.html();
    var shortmes=$message.html().substr(0,360);
    $message.html(shortmes);
    $btn.click(function () {
        if ($btn.text() == "...显示全部") {
            $message.html(fullmes);
            $(this).text("收起")
        }else {
            $message.html(shortmes);
            $(this).text("...显示全部");
        }
        return false
    });
}

function sortSongList() {
    //对歌曲清单按照播放量排序并添加序号
    var $songTbody=$(".song-list tbody");
    var $trList=$songTbody.find("tr");
    var tdIndex=[];
    //获取服务器歌曲信息包括名称、播放量统计、地址
    $.get("src/data/songs.json").done(function (data) {
        $trList.each(function (i) {
            //将返回的歌曲名和播放量统计依次插入td单元格
            $(this).children("td:eq(2)").html(data.songs[i].name);
            $(this).find(".song-stats-value").html(data.songs[i].stats);
            //将链接地址保存到每个TR的link属性上
            var myTr = $(this)[0];
            myTr.link = data.songs[i].link;
            //将播放量统计转换格式存入tdIndex数组，并保存给每个Tr的stats属性
            var stats =data.songs[i].stats.replace(/,/g ,"");
            tdIndex[i] = parseInt(stats);
            myTr.stats = parseInt(stats);
        });
        //生成td播放量从多至少的排序数组tdIndex
        tdIndex.sort(function (a, b) {
            return b-a;
        });
        setTrIndex();
        //对tr根据tdIndex排序
        function setTrIndex() {
            for (var i=0;i<tdIndex.length;i++){
                var trCont=tdIndex[i];
                //tdIndex是按照播放量高到低排序的，现在遍历tr，将符合idIndex[i]的stats的tr插到底部
                $trList.each(function (){
                    var myTr = $(this)[0];
                    var stats = myTr.stats;
                    if ( stats == trCont){
                        $songTbody.append($(this));
                        $(this).children("td:eq(0)").text(i+1);
                        myTr.songIndex = i+1;
                    }
                    //设置一个长度，根据最高播放量基准
                    var statWid = 10+(stats/tdIndex[0])*200;
                    //设置每个stats单元格的背景条长度
                    $(this).find(".song-list-stats div").width(statWid);
                })
            }
        }
    });
}
function showGigPic() {
    //演出信息照片墙
    var $pic = $(".gig-pic");
    $pic.each(function (i) {
        $(this).css({"background":"url('src/img/gigpic/"+i+".jpg')","background-position":"center","background-size":"auto 100%"});
    })

}

function prepareConNav() {
    //con-nav侧边导航功能
    var $btn = $(".con-nav-btn");
    var $box = $(".con-main .con-box");
    $box.hide().show("normal");
    $btn.each(function () {
        $(this)[0].btnStat = true ;
        $(this)[0].oldName = $(this).html();
    });
    $btn.click(function () {
        var index = $(this).index();
        if (!$(this).is(":animated")){
            if ($(this)[0].btnStat) {
                //选取并显示对应序号的con-main中的con-box板块，隐藏兄弟单元
                $box.eq(index).show("fast")
                    .siblings().hide("fast");
                $btn.each(function () {
                    //对每个按钮初始化，还原命名与开关状态
                    $(this)[0].btnStat = true ;
                    $(this).html($(this)[0].oldName);
                });
                //标记此按钮的btnStat为false，内容改为显示全部
                $(this)[0].btnStat = false;
                $(this).html("显示全部");
            }else{
                $box.show("fast");
                $btn.each(function () {
                    $(this)[0].btnStat = true ;
                    $(this).html($(this)[0].oldName);
                })
            }
        }
        return false;
    })
}
function rollBtn() {
    //footer相似艺术家左右滑动按钮
    var $box = $(".gall-box");
    var index = 0;
    $("#arts-right-btn").click(function () {
        if (!$box.is(":animated")) {
            if (index == 8){
                index = 0
            }
            var leftMove = 400*(7-index)+"px";
            $box.animate({left: "-=400px"}, 1000)
                .eq(index).animate({"left":leftMove},0);
            index ++;
        }
        return false;
    });
    $("#arts-left-btn").click(function () {
        if (!$box.is(":animated")) {
            if (index == 0){
                index = 8
            }
            var leftMove = -(400*(index-1))+"px";
            $box.animate({left: "+=400px"}, 1000)
                .eq((index-1)).animate({"left":leftMove},0);
            index --;
        }
        return false;
    });
}
function prepareAudio() {
    //播放器功能
    var player = $("#audio")[0];
    var $btnPlay = $("#btn-play");
    var $btnLast = $("#btn-last");
    var $btnNext = $("#btn-next");
    var $trIndex = $(".song-list-index");
    var $audioInfo = $("#audio-info");
    var $hotSongBtn = $("#hot-song-play");
    $(".audio-play").click(function () {
        var myTr = $(this).parent().parent()[0];
        var songIndex = myTr.songIndex;
        if (player.currentIndex != songIndex){
            playIndex(songIndex);
        }
        return false;
    });
    var listLength = $trIndex.length;
    $btnNext.click(function () {
        if (player.currentIndex == undefined) return false;
        if ( player.currentIndex == listLength){
            player.currentIndex = 1;
        }else {
            player.currentIndex ++;
        }
        playIndex(player.currentIndex);
        return false;
    });
    $btnLast.click(function () {
        if (player.currentIndex == undefined) return false;
        if ( player.currentIndex == 1){
            player.currentIndex = listLength;
        }else {
            player.currentIndex --;
        }
        playIndex(player.currentIndex);
        return false;
    });
    $btnPlay.click(function () {
        if (player.currentIndex == undefined){
            player.currentIndex = 1;
            playIndex(player.currentIndex);
            return false;
        }
        if(player.paused){
            player.play();
            $(this).removeClass("top-audio-btn-play").addClass("top-audio-btn-pause");
         }else {
             player.pause();
            $(this).removeClass("top-audio-btn-pause").addClass("top-audio-btn-play");
         }
        return false;
    });
    $hotSongBtn.click(function () {
        if (player.currentIndex != 1){
            playIndex(1);
        }
        return false;
    });
    function playIndex(songIndex) {
        $trIndex.each(function () {
            var myTr = $(this).parent("tr")[0];
            var thisIndex = myTr.songIndex;
            if (thisIndex == songIndex){
                var links = myTr.link;
                player.src = links;
                player.play();
                $btnPlay.removeClass("top-audio-btn-play").addClass("top-audio-btn-pause");
                player.currentIndex = songIndex;
                var songName = $(this).next().next().html();
                $audioInfo.html(songName);
                $(this).next().next().addClass("current-audio");
                $(this).parent().siblings().find(".song-list-name").removeClass("current-audio");
            }
        })
    }
}