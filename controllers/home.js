/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

exports.conference = (req, res) => {
  res.render('conference', {
    room: req.params.room,
    title: 'conference'
  });
};