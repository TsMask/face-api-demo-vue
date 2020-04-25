<template>
  <div id="app">
    <div id="nav">
      <ul>
        <li v-for="(item, index) in $router.options.routes" :key="index">
          <router-link :to="item.path" v-text="item.name"></router-link>
        </li>
      </ul>
    </div>
    <div id="content">
      <router-view />
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: row;
  color: #2c3e50;
}

#nav {
  min-width: 200px;
  border: 2px #42b983 solid;
  padding: 10px;
  margin-right: 20px;
}

#nav ul,
#nav li {
  list-style: none;
  margin: 10px 0;
  padding: 0;
  line-height: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#content {
  flex-grow: 1;
  border: 2px #42b983 solid;
  padding: 20px;
}
</style>
