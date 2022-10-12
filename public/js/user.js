
$(document).ready(function () {
  var current_fs, next_fs, previous_fs; //fieldsets
  var opacity;

  $(".next").click(function () {
    var regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g;
    var regPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    var user_name = $("#user_name").val();
    if (user_name == "") {
      $("#unameError").text("**User name is required");
    } else {
      $("#unameError").text("");
    }

    var email = $("#personal_email").val();
    if (email == "") {
      $("#emailError").text("**Email Address is Required");
    } else if (!regEmail.test(email)) {
      $("#emailError").text("**Enter Valid Email Address");
    } else {
      $("#emailError").text("");
    }

    var password = $("#password").val();
    if (password == "") {
      $("#passwordError").text("**Password is required");
       return false
    } else if (!regPassword.test(password)) {
      $("#passwordError").text(
        "**Password must be include letters, special characters and digits"
      );
        return false
    } else {
      $("#passwordError").text("");
    }

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    //Add Class Active
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          next_fs.css({ opacity: opacity });
        },
        duration: 600,
      }
    );
    return false;
  });

  $(".next1").click(function () {
    var regName = /^[a-zA-Z]+ [a-zA-Z]+$/;
    var regNumber = /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/;


    var role_id = $("#role_id").val();
    if (role_id == "select") {
      $("#roleError").text("Please Select a Role");
    } else {
      $("#roleError").text("");
    }

    var emp_code = $("#emp_code").val();
    if (emp_code == "") {
      $("#empError").text("Please Enter Employee Code");
    } else {
      $("#empError").text("");
    }
    var reporting_user_id = $("#reporting_user_id").val();
    if (reporting_user_id == "") {
      $("#repError").text("Please Enter reporting user Code");
    } else {
      $("#repError").text("");
    }

    var firstname = $("#firstname").val();
    if (firstname == "") {
      $("#fnameError").text("Please Enter Your firstname");
    } else if (!/^[A-Za-z ]+$/.test(firstname)) {
      $("#fnameError").text("please Enter only alphabates");
      return false;
    } else {
      $("#fnameError").text("");
    }

    var middle_name = $("#middle_name").val();
    if (middle_name == "") {
      $("#mnameError").text("Please Enter Your Middlename");
    } else if (!/^[A-Za-z ]+$/.test(middle_name)) {
      $("#mnameError").text("please Enter only alphabates");
      return false;
    } else {
      $("#mnameError").text("");
    }

    var last_name = $("#last_name").val();
    if (last_name == "") {
      $("#lnameError").text("Please Enter Your Lastname");
    } else if (!/^[A-Za-z ]+$/.test(last_name)) {
      $("#lnameError").text("please Enter only alphabates");
      return false;
    } else {
      $("#lnameError").text("");
    }
    var male = $("#male").is(":checked");
    var female = $("#female").is(":checked");
    var other = $("#other").is(":checked");
    if (!male && !female && !other) {
      $("#genderError").text("Please Select gender");
    } else {
      $("#genderError").text("");
    }

    var dob = $("#dob").val();
    // alert(dob)
    if (dob == "") {
      $("#dobError").text("Please Select Your Date Of bIrth");
    } else {
      $("#dobError").text("");
    }

    var doj = $("#doj").val();
    if (doj == "") {
      $("#dojError").text("Please Select Your joining date");
    } else {
      $("#dojError").text("");
    }

    var mo_number = $("#mo_number").val();
    if (mo_number == "") {
      $("#moError").text("Please Enter Your Mobile Number");
    }else if(!/^(\()?\d{3}(\))?\d{3}\d{4}$/.test(mo_number)){
        $("#moError").text("your number must be 10 digits ");
    }
    else {
      $("#moError").text("");
    }

    var add_1 = $("#add_1").val();
    if (add_1 == "") {
      $("#add1Error").text("Please Enter Your Address");
    } else {
      $("#add1Error").text("");
    }

    var add_2 = $("#add_2").val();
    if (add_2 == "") {
      $("#add2Error").text("Please Enter Your Address");
      return false;
    } else {
      $("#add2Error").text("");
    }
    //     var bank_account_no=$('#bank_account_no').val()
    //     if(bank_account_no==""){
    //   $('#accError').text('Please Enter Your Account Number');

    //     }else{
    //       $('#accError').text('')
    //     }
    //     var bank_name=$('#bank_name').val()
    //     if(bank_name==""){
    //   $('#bnameError').text('Please Enter Your Bank name');

    //     }else{
    //       $('#bnameError').text('')
    //     }
    //     var ifsc_code=$('#ifsc_code').val()
    //     if(ifsc_code==""){
    //   $('#ifscError').text('Please Enter Your IFSC code');

    //     }else{
    //       $('#ifscError').text('')
    //     }

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    //Add Class Active
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          next_fs.css({ opacity: opacity });
        },
        duration: 600,
      }
    );
    return false;
  });

  $(".previous").click(function () {
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //Remove class active
    $("#progressbar li")
      .eq($("fieldset").index(current_fs))
      .removeClass("active");

    //show the previous fieldset
    previous_fs.show();

    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          previous_fs.css({ opacity: opacity });
        },
        duration: 600,
      }
    );
  });

  $(".radio-group .radio").click(function () {
    $(this).parent().find(".radio").removeClass("selected");
    $(this).addClass("selected");
  });

  $(".submit").click(function () {
    return false;
  });
});

function check() {
  var bank_account_no = document.getElementById("bank_account_no").value;
  if (bank_account_no == "") {
    document.getElementById("accError").innerHTML =
      "Please type Your Account Number";
  } else {
    document.getElementById("accError").innerHTML = "";
  }
  var bank_name = document.getElementById("bank_name").value;
  if (bank_name == "") {
    document.getElementById("bnameError").innerHTML =
      " bank name Name is required";
  } else {
    document.getElementById("bnameError ").innerHTML = "";
  }

  var ifsc_code = document.getElementById("ifsc_code").value;
  if (ifsc_code == "") {
    document.getElementById("ifscError").innerHTML = "Please Enter IFSC code ";
    return false
  } else {
    document.getElementById("ifscError ").innerHTML = "";
  }
}
