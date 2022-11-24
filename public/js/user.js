$(document).ready(function(){
  var current_fs, next_fs, previous_fs; //fieldsets
  var opacity;
  var tmp = null;
  $("#personal_email").blur(function(){
      var userEmail = this.value;
        $.ajax({
          type: "POST",
          url: "http://localhost:46000/checkEmail/",
          data: {'UserEmail' : userEmail},
          dataType:"json",
          success: function(response){
           console.log(response.emailExists)
            $("#nxtButton").html('');
            $("#emailError").html('');
           if(response.emailExists==null){
            $('#nxtButton').removeClass('disabled')
            $('#nxtButton').append('<a>Next Step</a>')    
          }else{
            $("#emailError").text("**Email Already Exist");
            $('#nxtButton').addClass('btn disabled') 
            $('#nxtButton').append('<a>Next Step</a>')           
        } 
        ;
      }
    });
  });

  
  var current_fs, next_fs, previous_fs; //fieldsets
  var opacity;

  $(".next").click(function () {
    var regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g;
    var regPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    var user_name = $("#user_name").val();
    if (user_name == "") {
     var unameError =  $("#unameError").text("**User name is required");
    } else {
      $("#unameError").text("");
    }

    var email = $("#personal_email").val();
    if (email == "") {
    var emailError =  $("#emailError").text("**Email Address is Required");
    } else if (!regEmail.test(email)) {
      var emailError= $("#emailError").text("**Enter Valid Email Address");
    } else {
      $("#emailError").text("");
    }

    var password = $("#password").val();
    if (password == "") {
     var passwordError =  $("#passwordError").text("**Password is required");
    } else if (!regPassword.test(password)) {
     $("#passwordError").text(
        "**Password must be include letters, special characters and digits"
      );
     return false;
    } else {
      $("#passwordError").text("");
    }
    
    if (unameError||emailError||passwordError) {
      return false;
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
  });

  $(".next1").click(function () {
    var regName = /^[a-zA-Z]+ [a-zA-Z]+$/;
    var regNumber = /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/;

    var role_id = $("#role_id").val();
    alert(role_id)
    if (role_id == "select") {
      var roleError = $("#roleError").text("Please Select a Role");
    } else {
      $("#roleError").text("");
    }

    var emp_code = $("#emp_code").val();
    if (emp_code == "") {
      var empError = $("#empError").text("Please Enter Employee Code");
    } else {
      $("#empError").text("");
    }
    var reporting_user_id = $("#reporting_user_id").val();
    // alert(reporting_user_id)
    if (reporting_user_id == "") {
      var repError = $("#repError").text("Please Enter reporting user Code");
    } else {
      $("#repError").text("");
    }
    var firstname = $("#firstname").val();
    if (firstname == "") {
      var fnameError = $("#fnameError").text("Please Enter Your firstname");
    } else if (!/^[A-Za-z ]+$/.test(firstname)) {
      $("#fnameError").text("please Enter only alphabates");
      return false;
    } else {
      $("#fnameError").text("");
    }

    var middle_name = $("#middle_name").val();
    if (middle_name == "") {
      var mnameError = $("#mnameError").text("Please Enter Your Middlename");

    } else if (!/^[A-Za-z ]+$/.test(middle_name)) {
      $("#mnameError").text("please Enter only alphabates");
      return false;
    } else {
      $("#mnameError").text("");
    }

    var last_name = $("#last_name").val();
    if (last_name == "") {
      var lnameError = $("#lnameError").text("Please Enter Your Lastname");
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
      var genderError = $("#genderError").text("Please Select gender");
    } else {
      $("#genderError").text("");
    }

    var dob = $("#dob").val();
    if (dob == "") {
      var dobError = $("#dobError").text("Please Select Your Date Of bIrth");
    } else {
      $("#dobError").text("");
    }

    var doj = $("#doj").val();
    if (doj == "") {
      var dojError = $("#dojError").text("Please Select Your joining date");
    } else {
      $("#dojError").text("");
    }

    var mo_number = $("#mo_number").val();
    if (mo_number == "") {
      var moError = $("#moError").text("Please Enter Your Mobile Number");
    } else if (!/^(\()?\d{3}(\))?\d{3}\d{4}$/.test(mo_number)) {
      $("#moError").text("your number must be 10 digits ");
    }
    else {
      $("#moError").text("");
    }

    var add_1 = $("#add_1").val();
    if (add_1 == "") {
      var add1Error = $("#add1Error").text("Please Enter Your Address");
    } else {
      $("#add1Error").text("");
    }

    var country = $("#countryId").val();
    if (country == "") {
      var countryError = $("#countryError").text("Please Select Country");

    } else {
      $("#countryError").text("");
    }
    var state = $("#stateId").val();
    if (state == "") {
      var stateError = $("#stateError").text("Please Select State");

    } else {
      $("#stateError").text("");
    }

    var city = $("#cityId").val();
    if (city == "") {
      var cityError = $("#cityError").text("Please Select City");

    } else {
      $("#cityError").text("");
    }
    var pincode = $("#pincode").val();
    if (pincode == "") {
      var pincodeError = $("#pincodeError").text("Please Select pincode");
    } else {
      $("#pincodeError").text("");
    }
    if (roleError || empError || repError || fnameError || mnameError || lnameError || dobError || dobError || dojError || moError || add1Error || countryError || stateError || cityError || pincodeError) {
      return false;
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
