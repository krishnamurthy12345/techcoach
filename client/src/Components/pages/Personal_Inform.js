import React from 'react'

const Personal = () => {
  return (
    <div>
        
      <form >
        <center><table>
          <tbody>
            <tr>
              <th>Year Born:</th>
              <td><input type="text" name="YearBorn"  placeholder="Year Born" /></td>
            </tr>
            <tr>
              <th>Gender:</th>
              <td>
                <input type="radio" id="male" name="Gender" value="male"  />
                <label htmlFor="male">Male</label>
                <input type="radio" id="female" name="Gender" value="female"  />
                <label htmlFor="female">Female</label>
                <input type="radio" id="other" name="Gender" value="other"  />
                <label htmlFor="other">Other</label>
              </td>
            </tr>
            <tr>
              <th>Added Date:</th>
              <td><input type="text" name="AddedDate"  placeholder="Added Date" /></td>
            </tr>
            <tr>
              <th>Type:</th>
              <td><input type="text" name="Type"  placeholder="Type" /></td>
            </tr>
            <tr>
              <th>Strength1:</th>
              <td><input type="text" name="Strength1"  placeholder="Strength1" /></td>
            </tr>
            <tr>
              <th>Strength2:</th>
              <td><input type="text" name="Strength2" placeholder="Strength2" /></td>
            </tr>
            <tr>
              <th>Skill:</th>
              <td><input type="text" name="Skill"  placeholder="Skill" /></td>
            </tr>
            <tr>
              <th>Attitude:</th>
              <td><input type="text" name="Attitude"  placeholder="Attitude" /></td>
            </tr>
            <tr>
              <th>Weakness:</th>
              <td><input type="text" name="Weakness"  placeholder="Weakness" /></td>
            </tr>
            <tr>
              <th>Communication:</th>
              <td><input type="text" name="Communication" placeholder="Communication" /></td>
            </tr>
            <tr>
              <th>Opportunity:</th>
              <td><input type="text" name="Opportunity"  placeholder="Opportunity" /></td>
            </tr>
            <tr>
              <th>Threat:</th>
              <td><input type="text" name="Threat"  placeholder="Threat" /></td>
            </tr>
          </tbody>
        </table>
          <button type="submit">Submit</button>
        </center>
      </form>

    </div>
  )
}

export default Personal