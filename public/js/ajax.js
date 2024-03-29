$(document).ready(function () {
    $("#project").on("change", function () {
        var selectedValue = this.value;
        $.ajax({
            type: "POST",
            url:  "/api/getUserByProject/" + selectedValue,
            data: { projectID: selectedValue },
            dataType: "json",
            success: function (response) {
                // //console.log("task",response)
                $("#user_id").html('<option value="" disabled selected> ' + "Select User" + ' </option>');
                $.map(response.tasks[0].userData, function (val, i) {
                    // Do something
                    // $("#user_id").append('<option value=' + '>' + "Select User" + '</option>');
                    $("#user_id").append(
                        '<option value="' +
                        val._id +
                        '"> ' +
                        val.firstname +
                        " " +
                        val.last_name +
                        " </option>"
                    );
                });
            },
        });
    });
});