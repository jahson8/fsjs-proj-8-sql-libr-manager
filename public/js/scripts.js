document.addEventListener("DOMContentLoaded", () => {
  /* =================
Stops form from submiting empty
 search
====================*/
  const searchForm = document.getElementById("search-form");
  console.log(searchForm);

  const handleSearch = (evt) => {
    const search = document.querySelector("#search").value;
    if (!search || search.match(/\s/g)) {
      evt.preventDefault();
      const msg = `<div class="error-msg">
        <p>Please Enter a valid Search Term</p>
      </div>`;

      const errMsg = document.querySelector(".error-msg");
      if (!errMsg) {
        document
          .querySelector(".search-group")
          .insertAdjacentHTML("afterend", msg);
      }
    }
  };

  searchForm.addEventListener("submit", handleSearch);
});
