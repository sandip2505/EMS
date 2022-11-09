$(document).ready(function(){
    $("#project").on("change", function() {
        var selectedValue = this.value;
        // alert(selectedValue)
        $.ajax ({
            url: "../../taskController/createtask",
            type: 'POST',
        data: {option : selectedValue},
        success: function(data) {
            // alert(data)
        }

        });
    });
});