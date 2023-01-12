$(document).ready(function(){
    $("#project").on("change", function() {
        var selectedValue = this.value;
          $.ajax({
            type: "POST",
<<<<<<< HEAD
            url: "http://localhost:44000/getUserByProject/"+selectedValue,
=======
            url: "http://localhost:48000/api/getUserByProject/"+selectedValue,
>>>>>>> 4582dbbe5c50c0202111fbc0d2664219e11cbd04
            data: {'projectID' : selectedValue},
            dataType:"json",
            success: function(response){
                // console.log("task",response)
                $("#user_id").html('');
                $.map( response.tasks[0].userData, function( val, i ) {
                    // Do something
                    // $("#user_id").append('<option value=' + '>' + "Select User" + '</option>');
                    $("#user_id").append('<option value="'+val._id+'"> '+ val.firstname +' '+ val.last_name +' </option>');
                });
            }
          });
    });
});