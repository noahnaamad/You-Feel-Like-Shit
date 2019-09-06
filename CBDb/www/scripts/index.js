// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    //cordova waiting to be loaded into memory
    //when it is, our app is ready
    //NEVER REMOVE THIS
    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);
        //capture the back button and stop it from exiting the app
        document.addEventListener("backbutton", function (event) { onBackKeyDown(event); });

        console.log("Device Ready");
        //after cordova is loaded into memory, hide the splash screen
        navigator.splashscreen.hide();

        /* ===== Variables ===== */
        // Create variables for our Forms
        var $elFormSignUp = $("#formSignUp"), // Short version of Line 56
            $elFormLogIn = $("#formLogIn");
        // Create Variables for the jQM Popups
        var $elPopErrorSignUpMismatch = $("#popErrorSignUpMismatch"),
            $elPopErrorSignUpExists = $("#popErrorSignUpExists"),
            $elPopErrorSignUpWeak = $("#popErrorSignUpWeak"),
            $elPopSuccessSignUpWelcome = $("#popSuccessSignUpWelcome"),
            $elPopErrorLogInNotExists = $("#popErrorLogInNotExists"),
            $elPopErrorLogInWrongPassword = $("#popErrorLogInWrongPassword"),
            $elPopErrorLogInTooMany = $("#popErrorLogInTooMany");
        // Create Variables dealing with Classes
        // In this case this Variable (Object) stores a reference to ALL instances of
        // any HTML Elements (Nodes) with the unique Class Attribute of "userEmail"
        var $elUserEmail = $(".userEmail");
        // Create Variables for "plain old buttons"
        var $elBtnLogOut = $("#btnLogOut");
        // Variable to store the email of who is currently logged in
        var uid = localStorage.getItem("whoIsLogged");
        //uninitialized variable to store a pouchdb database for each user
        var db;
        // pouchDB variables for working with comics
        var $elFormSaveComic = $("#formSaveComic");
        var $elBtnDeleteCollection = $("#btnDeleteCollection");
        var $elShowComicsTable = $("#showComicsTable");

        var $btnDeleteComic = $("#btnDeleteComic");
        var $btnEditComic = $("#btnEditComic");
        //object to keep track of the current comic (to delete)
        //keeps track of the last thing you clicked on
        var tmpComicToDelete; //undefined bc we don't know which comic has been clicked on
        //objects for editing a comic
        var $elFormEditComicsInfo = $("#formEditComicsInfo");
        var $elBtnEditComicsCancel = $("#btnEditComicsCancel");
        //objects for scanning a barcode or taking a photo
        var $elBtnScanBarcode = $("#btnScanBarcode");
        var $elBtnTakePhoto = $("#btnTakePhoto");
        //objects for sending developer email or connecting to social media
        var $elBtnEmail = $("#btnEmail");
        var $elBtnShare = $("#btnShare");

        // reusable function to initialize a database based on who is logged in
        function initDB() {
           /*
            every user has their own database named after their own email
            it's based on the currently logged in user (whoIsLogged)
            so, first get that email and store it in a var,
            then use it to create or connect to their database
            and return the local scope object back to global scope
            */
            var currentDB = localStorage.getItem("whoIsLogged");
            db = new PouchDB(currentDB); //either creates brand new database OR connects to existing database
            return db;
        }; //END initDB()

        /*
            A system to check if a person is logged in or not.
            If they are previously logged in, move them from pgWelcome to pgHome.
            If not, keep them at pgWelcome
            The following is NOT in a Function because we want it to run as soon as the app
                is loaded in memory. 
            Using a Conditional Statement, we can determine if the person is logged in or not
                and then move them to where they need to be
            To be safe we checked three things: is the cookie empty "" OR is it null OR undefined? 
        */
        if (uid === "" ||
            uid === null ||
            uid === undefined) {
            console.log("No User is logged in. Stay at pgWelcome");
            // Keep them here. Else Code Block does not run. 
        } else {
            console.log("A User IS logged in. Move them to pgHome");
            initDB(); //connect to existing user's database
            fnShowComicsPrep();
            $elUserEmail.html(uid);
            $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
        } // END If..Else to check if User is logged in or not



        /* ===== Functions ===== */

        function fnSignUp(event) {
            event.preventDefault();
          
            var $elInEmailSignUp = $("#inEmailSignUp"),
                $elInPasswordSignUp = $("#inPasswordSignUp"),
                $elInPasswordConfirmSignUp = $("#inPasswordConfirmSignUp");

            // Display the value of what they typed into the <input> fields, via the .val() JQ Method
            console.log("Their email is: " + $elInEmailSignUp.val());
            console.log("Their password is: " + $elInPasswordSignUp.val());
            console.log("Their confirmation is: " + $elInPasswordConfirmSignUp.val());

                if ($elInPasswordSignUp.val() !== $elInPasswordConfirmSignUp.val()) {
                    // If the Condition is TRUE, do the code in this block
                    console.log("Password DON'T match!");
                    // Activate the JQM popups after the user interacts
                    $elPopErrorSignUpMismatch.popup();
                    $elPopErrorSignUpMismatch.popup("open", { "transition": "flip" });
                    // Clear both Password fields so they may try again
                    // Using .val() Method we can read or write to an Input field
                    $elInPasswordSignUp.val("");
                    $elInPasswordConfirmSignUp.val("");
                } else {
                    // Store temporary copies of the email and password they entered
                    // converted to UPPERCASE to avoid issues with lowercase vs uppercase
                    // Note: password is also converted to UC, but you don't have to...
                    var tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(),
                        tmpValInPasswordSignUp = $elInPasswordSignUp.val();

                    if (localStorage.getItem(tmpValInEmailSignUp) === null) {
                        // User does not exist
                        console.log("This user does not exist");
                        // We save the User's email and password in localStorage
                        localStorage.setItem(tmpValInEmailSignUp, tmpValInPasswordSignUp);
                        console.log("New user saved: " + tmpValInEmailSignUp);
                        // Then reset the whole form, another user can create account
                        $elFormSignUp[0].reset();
                        $elPopSuccessSignUpWelcome.popup();
                        $elPopSuccessSignUpWelcome.popup("open", { "transition": "slideup" });
                    } else {
                        // User DOES exist, so show them an error popup about it
                        console.log("This user DOES exist");
                        $elPopErrorSignUpExists.popup();
                        $elPopErrorSignUpExists.popup("open", { "transition": "flip" });
                    } // END If..Else for checking if User exists
                } // END If..Else for checking if Passwords match
        } // END fnSignUp()

        // Function to deal with User logging in
        // Takes the event Parameter to prevent a refresh behavior
        function fnLogIn(event) {
            event.preventDefault();

            var $elInEmailLogIn = $("#inEmailLogIn"),
                $elInPasswordLogIn = $("#inPasswordLogIn"),
                tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),
                tmpValInPasswordLogIn = $elInPasswordLogIn.val();


            // If..Else to check if User exists in the system (localStorage
            // and then if the input password matches the stored password
            if (localStorage.getItem(tmpValInEmailLogIn) === null) {
                console.log("User does not exist in localStorage");
                $elPopErrorLogInNotExists.popup();
                $elPopErrorLogInNotExists.popup("open", { "transition": "flip" });
            } else {
                console.log("User DOES exist in localStorage");
                // If..Else to check if password input matches password stored
                if (tmpValInPasswordLogIn === localStorage.getItem(tmpValInEmailLogIn)) {
                    console.log("Passwords DO match!");
                    $elUserEmail.html(tmpValInEmailLogIn.toLowerCase());

                    // jQM code to move from the current screen (<section>) to another
                    // Move us from #pgLogIn to #pgHome
                    // Selecting the current screen, use pagecontainer Method, change to another
                    // screen and animate it with flip
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgHome", { "transition": "flip" });
                    // Save in Local Storage the last person to sign in
                    localStorage.setItem("whoIsLogged", tmpValInEmailLogIn);
                    //after a user logs in, create/connect to their database
                    initDB();
                    //then refresh the table with their comics
                    fnShowComicsPrep();
                } else {
                    console.log("Passwords do not match!");
                    $elPopErrorLogInWrongPassword.popup();
                    $elPopErrorLogInWrongPassword.popup("open", { "transition": "flip" });
                    $elInPasswordLogIn.val("");
                } // END If..Else checking if passwords match
            } // END If..Else checking if user exists in localStorage
        } // END fnLogIn()

        // Function to deal with User logging out
        function fnLogOut() {
            /* Conditional Statement to confirm if the user really wants to log out
                Introduction the Switch Conditional Statement	
                This checks from a list of known possibilities before making a decision
                or, goes to the "default" if all else fails choice
                Using the built-in .confirm() Method, we can ask a question
                with two possible responses: true or false
                Our Switch waits for their interaction, then captures true/false
                then deals with it. 
                Pro tip: try putting the most common possibility first
            */
            switch (window.confirm("Are you sure you want to log out?")) {
                case true:
                    console.log("They DO want to log out");
                    // Clear the Log In form of the last User that logged in
                    $elFormLogIn[0].reset();
                    // Mark that the current user logged out
                    localStorage.setItem("whoIsLogged", "");
                    // To-do: Save any unsaved comic data
                    // Then move from the current screen to the Welcome screen
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome", { "transition": "slidedown" });
                    break;
                case false:
                    console.log("They DO NOT want to log out");
                    break;
                case "maybe":
                    console.log("They might want to want to log out");
                    break;
                default:
                    console.log("We don't know what they want");
                    break;
            } // END Switch to confirm logging out
        } // END fnLogOut()

        function fnGetFirstWord(title){
            if (title.indexOf(" ") === -1){ //checking if there's no empty space
                return title;
            } else {
                return title.substr(0, title.indexOf(" "));
            };
        }; // END fnGetFirstWord

        function fnPrepComic() {
            var $valInTitle = $("#inTitle").val();
            var $valInYear = Number($("#inYear").val());
            var $valInNumber = Number($("#inNumber").val());
            var $valInNotes = $("#inNotes").val();
            var $valInPublisher = $("#inPublisher").val();
            var $valInBarcode = Number($("#inBarcode").val());
            var $valInPhoto = $("#inPhoto").val();

            //Temp versions of the title of the comic
            var tempID1 = fnGetFirstWord($valInTitle.toUpperCase());
            var tempID2 = $valInTitle.toUpperCase();

            switch (tempID1){
                case "THE":
                    tempID2 = tempID2.replace("THE ", "");
                    break;
                case "A":
                    tempID2 = tempID2.replace("A ", "");
                    break;
                case "AN":
                    tempID2 = tempID2.replace("AN ", "");
                    break;
                default:
                    break;
            }

            var tempComic = {
                "_id": tempID2 + $valInYear + $valInNumber,
                "title": $valInTitle,
                "number": $valInNumber,
                "year": $valInYear,
                "publisher": $valInPublisher,
                "notes": $valInNotes,
                "barcode": $valInBarcode,
                "photo": $valInPhoto
            };
            
            return tempComic;
        }; // END fnPrepComic

        function fnSaveComic(event) {
            event.preventDefault();
            var aComic = fnPrepComic();

            db.put(aComic, function (failure, success) {
                if (failure){
                    console.log("failed to save data because " + failure);
                    switch (failure.status) {
                        case 400:
                            console.log("data must be in JSON format");
                            break;
                        case 409:
                            console.log("_id already in use: " + aComic._id);
                            window.alert("You've already saved this comic");
                            break;
                        case 412:
                            console.log("_id is empty");
                            break;
                        default:
                            console.log("unknown error: " + failure.status);
                            break;
                    }
                } else {
                    console.log("saved and " + success);
                    $elFormSaveComic[0].reset();
                    $("#popComicSave").popup();
                    $("#popComicSave").popup("open", { "transition": "slideup" });
                    fnShowComicsPrep();
                };
            });
        }; //END fnSaveComic

        function fnDeleteCollection() {
           
            switch (window.confirm("You are about to delete your collection of comic books. Are you sure?")){
                case true:
                    console.log("they wish to delete");
                    if (window.confirm("This will delete every comic book you have saved. Confirm?")){
                        console.log("second confirmation, they wanna delete");
                        db.destroy(function (failure, success) {
                            if (failure){
                                console.log("failure to delete pouchDB: " + failure);
                                window.alert("ERROR \nContact developer: noahnaamad@gmail.com");
                            } else {
                                console.log("successfully deleted pouchDB: " + success);
                                window.alert("your mom threw out your comics successfully");
                                initDB();
                                //TODO: update list of comics displayed
                            };
                        });
                        //when we destroy the database, we get either a success or a failure
                    } else {
                        console.log("they decided not to fully delete");
                    };
                    break;
                case false:
                    console.log("they don't want to delete");
                    break;
                default:
                    console.log("idek");
                    break;
            };
        }; //END fnDeleteCollection

        function fnShowComicsPrep() {
     
            //get all _id's of our data
            //we will then use Options to specify what we want
            //note JSON syntax for our options
            //ascending: true alphabetizes the order
            //include_docs: true gives all the fields of a record
            db.allDocs({ "ascending": true, "include_docs": true },
                function (failure, success) {
                    if (failure) {
                        console.log("getting all documents failed: " + failure);
                    } else {
                        //pass this prepared data to fnShowComicsTable
                        fnShowComicsTable(success.rows);
                        }
                }
            );
        }; //END fnShowComicsPrep

        //to get 1 comic, db.get("SPIDERMAN19631")
        //to get a group of comics, db.allDocs();
        function fnShowComicsTable(data) {
            //1 prepare data (use another function, fnShowComicsPrep)
            //2 display data

            /* 
                display a table with rows for each comic
                a column for the title, and number
                and an icon for "view details"
                then a pop-up with the details
            */
            
            var str = "<table> <tr> <th>Title</th> <th>#</th> <th>Details</th> </tr>";

            for (var i = 0; i < data.length; i++){
                //data-[whatever] is an HTML5 attribute
                //we can invent any data-[whatever] and populate it
                //with anything we want
                //in our case, set it to the _id of the comic in this row
                //when a user clicks any of the speech bubbles, js wil know which comic we meant
                //because of the _id associated with the row
                str += "<tr data-id='" + data[i].doc._id + "'> <td>" + data[i].doc.title + "</td> <td>" + data[i].doc.number + "</td> <td class='btnShowComicsInfo'>&#x1F4AC;</td> </tr>";
            }; //END for loop

            str += "</table > ";

            $elShowComicsTable.html(str);
        }; //END fnShowComicsTable

        function fnShowComicsInfo(thisComic) {
            //output the data-id attribute
            console.log(thisComic.data("id"));

            //as long as this function is running, going to store a reference to the id of the comic
            var tmpComic = thisComic.data("id");

            //keep track of current comic so we know which one to delete or edit
            tmpComicToDelete = tmpComic;

            //retrieve all the fields of the current comic to display on-screen
            db.get(tmpComic, function (failure, success) { //tmpComic is storing the id
                if (failure){
                    console.log("couldn't show this comic: " + tmpComic + " " + failure);
                } else {
                    //if success, pouchdb gives us the object back with all of its fields
                    console.log("showing comic: " + success.title);

                    $("#divViewComicsInfo p:eq(0)").html(success.title);
                    $("#divViewComicsInfo p:eq(1)").html(success.number);
                    $("#divViewComicsInfo p:eq(2)").html(success.year);
                    $("#divViewComicsInfo p:eq(3)").html(success.publisher);
                    $("#divViewComicsInfo p:eq(4)").html(success.notes);
                    $("#divViewComicsInfo p:eq(5)").html(success.barcode);
                    // populating img src attribute is different
                    //"find the divViewComicsInfo, which has a child p (the 6th one), which has a child img"
                    //using .attr() method (of jQuery) we can read or write a particular attribute
                    $("#divViewComicsInfo p:eq(6) img").attr("src", success.photo);
                }
            }); 

            //display the popup info screen, after filling in the <p> tags
            $(":mobile-pagecontainer").pagecontainer("change", "#popViewComicsInfo", {"role":"dialog"});
        }; //END fnShowComicsInfo

        function fnDeleteComic() {
            console.log("about to delete comic: " + tmpComicToDelete);

            //first check that the comic is in the database
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("ERROR: could not access comic: " + failure);
                } else {
                    console.log("successfully found comic to delete: " + success);
                    //confirm they really want to delete
                    switch(window.confirm("About to delete this comic! \nAre you sure?")){
                        case true:
                            console.log("proceeding to delete");
                            //to remove one item from the pouchdb database
                            db.remove(success, function (failure, success) {
                                if (failure) {
                                    console.log("failed to delete comic: " + failure);
                                } else {
                                    console.log("successfully deleted comic: " + success);
                                    //need to close the popup, and redraw the table
                                    fnShowComicsPrep();
                                    //if we are currently looking at a dialog box (which we should be), close the dialog box
                                    $("#popViewComicsInfo").dialog("close");
                                };
                            });
                            break;
                        case false:
                            console.log("they don't want to delete");
                            break;
                        default:
                            console.log("we don't know what they want. don't delete");
                            break;
                    };
                };
            });
            //then, confirm that they want to delete the comic
        }; //END fnDeleteComic

        function fnEditComic() {
            //get fields of currently selected comic and fill out form input fields
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("couldn't get info for the comic: " + failure);
                } else {
                    console.log("got info for the comic: " + success.title);
                    $("#inTitleEdit").val(success.title);
                    $("#inNumberEdit").val(success.number);
                    $("#inYearEdit").val(success.year);
                    $("#inPublisherEdit").val(success.publisher);
                    $("#inNotesEdit").val(success.notes);
                    $("#inBarcodeEdit").val(success.barcode);
                };
            });

            $(":mobile-pagecontainer").pagecontainer("change", "#popEditComicsSection", { "role": "dialog" });

        }; //END fnEditComic

        function fnEditComicsCancel() {
            //because user cancelled, close the current screen (popup)
            $("#popEditComicsSection").dialog("close");
            //to do: make it vibrate when canceling
        }; //END fnEditComicsCancel

        function fnEditComicsSubmit(event) {
            event.preventDefault();
            console.log("fnEditComicSubmit is running");

            var $valInTitleEdit = $("#inTitleEdit").val();
            var $valInNumberEdit = Number($("#inNumberEdit").val());
            var $valInYearEdit = Number($("#inYearEdit").val());
            var $valInPublisherEdit = $("#inPublisherEdit").val();
            var $valInNotesEdit = $("#inNotesEdit").val();
            var $valInBarcodeEdit = Number($("#inBarcodeEdit").val());

            //best practice is to confirm the data in pouchdb, then update it
            //and add a new revision number
            db.get(tmpComicToDelete, function (failure, success) {
                if (failure) {
                    console.log("failed to get the comic: " + failure);
                } else {
                    console.log("about to update the comic: " + success.title);
                    //after confirming comic exists, re-insert to pouchdb
                    //and include a new _rev field for revision number
                    //(a reserved field! , like how _id is reserved)
                    db.put({
                        "_id": success._id,
                        "title": $valInTitleEdit,
                        "number": $valInNumberEdit,
                        "year": $valInYearEdit,
                        "publisher": $valInPublisherEdit,
                        "notes": $valInNotesEdit,
                        "barcode": $valInBarcodeEdit,
                        "_rev": success._rev
                    }, function (failure, success) {
                        if (failure) {
                            console.log("failed to update the comic: " + failure);
                        } else {
                            console.log("successfully updated comic: " + success);
                            //redraw table, update info screen, close out edit popup
                            $("#divViewComicsInfo p:eq(0)").html("Title: " + $valInTitleEdit);
                            $("#divViewComicsInfo p:eq(1)").html("Number: " + $valInNumberEdit);
                            $("#divViewComicsInfo p:eq(2)").html("Year: " + $valInYearEdit);
                            $("#divViewComicsInfo p:eq(3)").html("Publisher: " + $valInPublisherEdit);
                            $("#divViewComicsInfo p:eq(4)").html("Notes: " + $valInNotesEdit);
                            fnShowComicsPrep();
                            $("#popEditComicsSection").dialog("close");
                        };
                    });
                };
            });
        }; //END fnEditComic

        //third party barcode scanner
        // https://github.com/phonegap/phonegap-plugin-barcodescanner
        function fnScanBarcode() {
            console.log("fnScanBarcode is running");

            //user presses button, turns on camera to scan barcode
            //barcode is scanned and passed to the input field
            //when they save comic, that data in new input
            //is bundled withou our comic data and saved to pouchdb
            cordova.plugins.barcodeScanner.scan(
                function (success) {
                    console.log("type of barcode: " + success.format);
                    console.log("data in the barcode: " + success.text);
                    $("#inBarcode").val(success.text);
                },
                function (failure) {
                    window.alert("scanning failed: " + failure);
                },
                {
                    "prompt": "Place the comic's barcode in the scan area",
                    "resultDisplayDuration": 2000,
                    "orientation": "landscape",
                    "disableSuccessBeep": false
                }
            );

        }; //END fnScanBarcode

        function fnTakePhoto() {
            console.log("fnTakePhoto is running");
            // camera syntax: navigator.camera.getPicture(success function, failure function, options);
            navigator.camera.getPicture(
                function (success) {
                    console.log("got photo: " + success);
                    $("#inPhoto").val(success);
                },
                function (failure) {
                    window.alert("picture failed: " + failure);
                },
                {
                    "quality": 100,
                    "saveToPhotoAlbum": true,
                    "targetWidth": 768,
                    "targetHeight": 1024
                }
            );
        }; //END fnTakePhoto

        function fnEmail() {
            console.log("fnEmail is running");

            window.plugins.socialsharing.shareViaEmail(
                "Regarding your app...<br>",
                "CBDb feedback",
                ['noah.naamad@gmail.com'], // TO: must be null or an array
                null, // CC: must be null or an array
                null, // BCC: must be null or an array
                'www/images/Unbeatable_Squirrel_Girl_Vol_2_7_Classic_Variant_Textless.jpg', // FILES: can be null, a string, or an array
                function (success) { console.log("success! " + success);}, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
                function (failure) { console.log("failure! " + failure);}
            );
        }; //END fnEmail

        function fnShare() {
            console.log("fnShare is running");

            window.plugins.socialsharing.share(
                "Check out the CBDb app!",//message (string),
                "Download CBDb today",//subject (string) [OPTIONAL depending on network],
                null, //attachments as an array of strings,
                "http://noahnaamad.com", //URL (string),
                function (success) { console.log("success! " + success); },
                function (failure) { console.log("failure! " + failure); }
            );
        }; //END fnShare


        /* ===== Event Listeners ===== */
        // Use .submit() (JQ) Method when Submitting a form
        $elFormSignUp.submit(function (event) { fnSignUp(event); });
        $elFormLogIn.submit(function (event) { fnLogIn(event); });
        // Use .on() (JQ) Method when it's a more "generic" action on a "plain old button"
        // Must specify which Event to listen for
        // Note: anonymous function is not necessary (unless...) and parens not needed
        $elBtnLogOut.on("click", fnLogOut);
        //event listener for when a person saves a comic
        $elFormSaveComic.submit(function (event) { fnSaveComic(event); });
        $elBtnDeleteCollection.on("click", fnDeleteCollection);
        //event listener for when we click on the speech bubble (that isn't there at runtime)
        //note: a second parameter: the class of the speech bubbles
        //we also capture the data-id info associated with the row that is clicked
        //note: $(this).parent()
        $elShowComicsTable.on("click", ".btnShowComicsInfo",
            function () { fnShowComicsInfo($(this).parent()) });
        $btnDeleteComic.on("click", fnDeleteComic);
        $btnEditComic.on("click", fnEditComic);
        $elFormEditComicsInfo.submit(function (event) { fnEditComicsSubmit(event); });
        $elBtnEditComicsCancel.on("click", fnEditComicsCancel);
        $elBtnScanBarcode.on("click", fnScanBarcode);
        $elBtnTakePhoto.on("click", fnTakePhoto);
        $elBtnEmail.on("click", fnEmail);
        $elBtnShare.on("click", fnShare);
    } //END onDeviceReady()

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }; //END onPause()

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }; //END onResume()

    function onBackKeyDown() {
        console.log("onBackKeyDown() is running");
        event.preventDefault();
    }; //END onBackKeyDown()
} )();