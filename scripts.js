$(document).ready(function () {
  const yearView = $("#year-view");
  const modal = $("#day-modal");
  const modalDate = $("#modal-date");
  const hourBlocks = $("#hour-blocks");
  const closeBtn = $(".close");
  const dateDisplay = $("#date-display");
  const container = $("#hour-blocks-container");

  let activityData = {};
  let isSelecting = false;
  let currentDate = "";
  let startX, startY;
  const selectionBox = $("#selection-box");

  const activityColors = {
    Work: "#FF6B6B",
    Sleep: "#4ECDC4",
    Exercise: "#45B7D1",
    Reading: "#FFA07A",
    Recreation: "#98D8C8",
  };

  function createYearView() {
    const year = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
        const date = new Date(year, month, day);
        const dayLine = $("<div>")
          .addClass("day-line")
          .attr("data-date", date.toISOString().split("T")[0]);

        if (day === 1) {
          dayLine.addClass("month-start");
        }

        dayLine.hover(
          function () {
            const hoverDate = new Date($(this).attr("data-date"));
            dateDisplay.text(
              hoverDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            );
          },
          function () {
            dateDisplay.text("");
          }
        );

        dayLine.click(function () {
          openDayModal($(this).attr("data-date"));
        });

        yearView.append(dayLine);
      }
    }
  }

  function openDayModal(date) {
    currentDate = date;
    modalDate.text(
      new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    hourBlocks.empty();

    for (let hour = 0; hour < 24; hour++) {
      const hourBlock = $("<div>")
        .addClass("hour-block")
        .attr("data-hour", hour)
        .text(hour);

      if (activityData[date] && activityData[date][hour]) {
        hourBlock.css(
          "background-color",
          activityColors[activityData[date][hour]]
        );
        hourBlock.text(`${hour}: ${activityData[date][hour]}`);
      }

      hourBlocks.append(hourBlock);
    }

    modal.css("display", "block");
  }

  container.on("mousedown", function (e) {
    if (e.target.classList.contains("hour-block")) {
      $(e.target).toggleClass("selected");
    } else {
      isSelecting = true;
      startX = e.pageX - container.offset().left;
      startY = e.pageY - container.offset().top;
      updateSelectionBox(e);
    }
    e.preventDefault();
  });

  $(document).on("mousemove", function (e) {
    if (isSelecting) {
      updateSelectionBox(e);
      selectOverlappingHours();
    }
  });

  $(document).on("mouseup", function () {
    isSelecting = false;
    selectionBox.hide();
  });

  function updateSelectionBox(e) {
    const containerOffset = container.offset();
    let currentX = e.pageX - containerOffset.left;
    let currentY = e.pageY - containerOffset.top;

    let left = Math.min(startX, currentX);
    let top = Math.min(startY, currentY);
    let width = Math.abs(currentX - startX);
    let height = Math.abs(currentY - startY);

    selectionBox.css({
      display: "block",
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px",
    });
  }

  function selectOverlappingHours() {
    const boxRect = selectionBox[0].getBoundingClientRect();
    $(".hour-block").each(function () {
      const hourRect = this.getBoundingClientRect();
      if (
        boxRect.left < hourRect.right &&
        boxRect.right > hourRect.left &&
        boxRect.top < hourRect.bottom &&
        boxRect.bottom > hourRect.top
      ) {
        $(this).addClass("selected");
      } else {
        $(this).removeClass("selected");
      }
    });
  }

  $(".classify-btn").click(function () {
    const activity = $(this).data("activity");
    classifySelectedHours(activity);
  });

  function classifySelectedHours(activity) {
    $(".hour-block.selected").each(function () {
      const hour = $(this).data("hour");
      if (!activityData[currentDate]) {
        activityData[currentDate] = {};
      }
      activityData[currentDate][hour] = activity;
      $(this).css("background-color", activityColors[activity]);
      $(this).text(`${hour}: ${activity}`);
      $(this).removeClass("selected");
    });
    saveData();
    console.log(`Updated activities for ${currentDate}: ${activity}`);
    console.log("Current activity data:", activityData);
  }

  function saveData() {
    localStorage.setItem("activityData", JSON.stringify(activityData));
    console.log("Data saved to localStorage");
  }

  function loadData() {
    const savedData = localStorage.getItem("activityData");
    if (savedData) {
      activityData = JSON.parse(savedData);
      console.log("Data loaded from localStorage:", activityData);
    } else {
      console.log("No saved data found in localStorage");
    }
  }

  closeBtn.click(function () {
    modal.css("display", "none");
  });

  $(window).click(function (event) {
    if (event.target === modal[0]) {
      modal.css("display", "none");
    }
  });

  loadData();
  createYearView();
  console.log("Application initialized");
});
